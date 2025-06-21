import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, QueryCommand, UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async(event) => {
  var method = event.requestContext.http.method;

  if (method != 'POST') {
    return {
      statusCode: 405
    }
  }

  const leagueId = event['queryStringParameters']['leagueId'];

  if (!leagueId) {
    return {
      statusCode: 400
    }
  }

  // First we need to get the minimum wins to qualify 
  const getLeagueInfoCommand = new GetCommand({
    TableName: "BreakPointLeaguesTable",
    Key: {
        'leagueId': leagueId
    },
    ConsistentRead: true,
  });

  const getLeagueInfoResponse = await docClient.send(getLeagueInfoCommand);
    
  // If the database query fails than we should return the response and a 500 error code
  if (getLeagueInfoResponse.$metadata.httpStatusCode !== 200 || !getLeagueInfoResponse.Item) {
    return {
      body: getLeagueInfoResponse,
      statusCode: 500
    }
  }

  const minimumWinsToQualify = getLeagueInfoResponse.Item.playoffWins;
  console.log(`Minimum wins to qualify for playoffs: ${minimumWinsToQualify}`)

  // First we will set the league status in the league table from current to playoffs
  const updateLeagueIsActiveCommand = new UpdateCommand({
    TableName: 'BreakPointLeaguesTable',
    Key: {
      'leagueId': leagueId
    },
    UpdateExpression: 'set isActive = :playoffs',
    ExpressionAttributeValues: {
      ':playoffs': 'playoffs',
    }
  })

  const updateLeagueResponse = await docClient.send(updateLeagueIsActiveCommand);
  console.log('updateLeagueResponse: ')
  console.log(updateLeagueResponse);

  // Next we find everyone enrolled in the league (currentLeague === league) 
  const findCurrentLeagueMembersParams = {
    TableName : "BreakPointUserTable",
    IndexName : "users-by-current-league",
    KeyConditionExpression: "currentLeague = :currentLeague",
    ExpressionAttributeValues: {
        ":currentLeague": leagueId
    }
  }

  const findCurrentLeagueMembersCommand = new QueryCommand(findCurrentLeagueMembersParams)
  const findCurrentLeagueMembersResponse = await docClient.send(findCurrentLeagueMembersCommand);

  // If the database query fails than we should return the response and a 500 error code
  if (findCurrentLeagueMembersResponse.$metadata.httpStatusCode !== 200) {
    return {
      body: findCurrentLeagueMembersResponse,
      statusCode: 500
    }
  }

  // If there are no active league members than return
  if (findCurrentLeagueMembersResponse.Count === 0) {
    return {
      statusCode: 200
    }
  }

  // For everyone enrolled in the league if they have more than the min wins, set playoffLeague=leagueId otherwise add league to past leagues
  for (const leagueMember of findCurrentLeagueMembersResponse.Items) {

    // Get number of wins
    var paramsWon = {
      TableName: 'BreakPointSinglesMatchesTable',
      IndexName: 'matches-won-by-player',
      KeyConditionExpression: 'matchWinner = :cognitoId',
      FilterExpression: 'leagueId = :leagueId',
      ExpressionAttributeValues: {
        ':cognitoId': leagueMember.cognitoId,
        ':leagueId': leagueId
      },
    }
    const wonCommand = new QueryCommand(paramsWon)
    const ddbResponseWon = await docClient.send(wonCommand);

    console.log("ddbResponseWon: ")
    console.log(ddbResponseWon)

    if (ddbResponseWon.$metadata.httpStatusCode !== 200) {
      return {
        statusCode: 500
      }
    }
    const numWins = ddbResponseWon.Count;

    if (numWins >= minimumWinsToQualify) {
      console.log(`Player ${leagueMember.cognitoId} qualifies for playoffs with ${numWins} wins`)
    
      const updatePlayoffLeagueCommand = new UpdateCommand({
        TableName: 'BreakPointUserTable',
        Key: {
          'cognitoId': leagueMember.cognitoId
        },
        UpdateExpression: 'set playoffLeague = :leagueId',
        ExpressionAttributeValues: {
          ':leagueId': leagueId
        }
      })

      const updatePlayoffLeagueResponse = await docClient.send(updatePlayoffLeagueCommand)

      console.log(updatePlayoffLeagueResponse)

      if (updatePlayoffLeagueResponse.$metadata.httpStatusCode !== 200) {
        return {
          updatePlayoffLeagueResponse: updatePlayoffLeagueResponse,
          statusCode: 500
        }
      }
    } else {
      console.log(`Player ${leagueMember.cognitoId} does not qualify for playoffs with ${numWins} wins`)
      // In this case we should just move the league to past leagues and call it a day
      const pastLeagues = leagueMember.pastLeagues

      console.log(`Adding ${leagueId} to ${pastLeagues}`)
      pastLeagues.push(leagueId)
      console.log(`pastLeagues`)
      

      const updatePastLeaguesCommand = new UpdateCommand({
        TableName: 'BreakPointUserTable',
        Key: {
          'cognitoId': leagueMember.cognitoId
        },
        UpdateExpression: 'set pastLeagues = :pastLeagues',
        ExpressionAttributeValues: {
          ':pastLeagues': pastLeagues
        }
      })

      const updatePastLeaguesResponse = await (docClient.send(updatePastLeaguesCommand))

      if (updatePastLeaguesResponse.$metadata.httpStatusCode !== 200) {
        return {
          body: updatePastLeaguesResponse,
          statusCode: 500
        }
      }
    }

    const updateCurrentLeagueCommand = new UpdateCommand({
      TableName: 'BreakPointUserTable',
      Key: {
        'cognitoId': leagueMember.cognitoId
      },
      UpdateExpression: 'set currentLeague = :currentLeague',
      ExpressionAttributeValues: {
        ':currentLeague': 'none'
      }
    })
  
    const updateCurrentLeagueResponse = await (docClient.send(updateCurrentLeagueCommand))

    if (updateCurrentLeagueResponse.$metadata.httpStatusCode !== 200) {
      return {
        body: updateCurrentLeagueResponse,
        statusCode: 500
      }
    }
  } 
  return {
    statusCode: 200
  }
}
