import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand, UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

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

  // First we will set the league status in the league table from future to current
  const updateLeagueIsActiveCommand = new UpdateCommand({
    TableName: 'BreakPointLeaguesTable',
    Key: {
      'leagueId': leagueId
    },
    UpdateExpression: 'set isActive = :current',
    ExpressionAttributeValues: {
      ':current': 'current',
    }
  })

  const updateLeagueResponse = await docClient.send(updateLeagueIsActiveCommand);
  console.log('updateLeagueResponse: ')
  console.log(updateLeagueResponse);

  // If the database query fails than we should return the response and a 500 error code
  if (updateLeagueResponse.$metadata.httpStatusCode !== 200) {
    return {
      body: updateLeagueResponse,
      statusCode: 500
    }
  }

  // Next we find everyone enrolled in the league (futureLeague === league) 
  const findFutureLeagueMembersParams = {
    TableName : "BreakPointUserTable",
    IndexName : "users-by-future-league",
    KeyConditionExpression: "futureLeague = :futureLeague",
    ExpressionAttributeValues: {
        ":futureLeague": leagueId
    }
  }

  const findFutureLeagueMembersCommand = new QueryCommand(findFutureLeagueMembersParams)
  const findFutureLeagueMembersResponse = await docClient.send(findFutureLeagueMembersCommand)

  console.log('findFutureLeagueMembersResponse')
  console.log(findFutureLeagueMembersResponse)

  // If the database query fails than we should return the response and a 500 error code
  if (findFutureLeagueMembersResponse.$metadata.httpStatusCode !== 200) {
    return {
      body: findFutureLeagueMembersResponse,
      statusCode: 500
    }
  }

  // If there are no active league members than return
  if (findFutureLeagueMembersResponse.Count === 0) {
    return {
      statusCode: 200
    }
  }


  for (const leagueMember of findFutureLeagueMembersResponse.Items) {
    console.log(`Setting currentLeague for ${leagueMember.cognitoId} to ${leagueId}`)

    const updateCurrentLeagueCommand = new UpdateCommand({
      TableName: 'BreakPointUserTable',
      Key: {
        'cognitoId': leagueMember.cognitoId
      },
      UpdateExpression: 'set currentLeague = :leagueId',
      ExpressionAttributeValues: {
        ':leagueId': leagueId
      }
    })

    const updateCurrentLeagueResponse = await docClient.send(updateCurrentLeagueCommand)

    console.log(updateCurrentLeagueResponse)

    if (updateCurrentLeagueResponse.$metadata.httpStatusCode !== 200) {
      return {
        body: updateCurrentLeagueResponse,
        statusCode: 500
      }
    }

    console.log(`Setting futureLeague for ${leagueMember.cognitoId} to ${leagueId}`)
    const updateFutureLeagueCommand = new UpdateCommand({
      TableName: 'BreakPointUserTable',
      Key: {
        'cognitoId': leagueMember.cognitoId
      },
      UpdateExpression: 'set futureLeague = :leagueId',
      ExpressionAttributeValues: {
        ':leagueId': 'none'
      }
    })

    const updateFutureLeagueResponse = await docClient.send(updateFutureLeagueCommand)
    console.log(updateFutureLeagueResponse)

    if (updateFutureLeagueResponse.$metadata.httpStatusCode !== 200) {
      return {
        body: updateFutureLeagueResponse,
        statusCode: 500
      }
    }
  }
  return {
    statusCode: 200
  }

}