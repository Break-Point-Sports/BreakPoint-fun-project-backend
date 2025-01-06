import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async(event) => {
  var method = event.requestContext.http.method

  if (method != 'GET') {
    return {
      statusCode: 405
    }
  }

  const leagueId = event['queryStringParameters']['leagueId']
  const cognitoId = event['queryStringParameters']['cognitoId']

  console.log('leagueId: ' + leagueId)
  console.log('cognitoId: ' + cognitoId)

  if (!leagueId || !cognitoId) {
    return {
      statusCode: 400
    }
  }

  var paramsWon = {
    TableName: 'BreakPointSinglesMatchesTable',
    IndexName: 'matches-won-by-player',
    KeyConditionExpression: 'matchWinner = :cognitoId',
    FilterExpression: 'leagueId = :leagueId',
    ExpressionAttributeValues: {
      ':cognitoId': cognitoId,
      ':leagueId': leagueId
    },
  }

  var paramsLost = {
    TableName: 'BreakPointSinglesMatchesTable',
    IndexName: 'matches-lost-by-player',
    KeyConditionExpression: 'matchLoser = :cognitoId',
    FilterExpression: 'leagueId = :leagueId',
    ExpressionAttributeValues: {
      ':cognitoId': cognitoId,
      ':leagueId': leagueId
    }
  }

    const wonCommand = new QueryCommand(paramsWon)
    const lostCommand = new QueryCommand(paramsLost)

    const ddbResponseWon = await docClient.send(wonCommand);
    const ddbResponseLost = await docClient.send(lostCommand)
    
    console.log("ddbResponseWon: ")
    console.log(ddbResponseWon)
    console.log("ddbResponseLost: ")
    console.log(ddbResponseLost)

    if (ddbResponseWon.$metadata.httpStatusCode == 200 && ddbResponseLost.$metadata.httpStatusCode == 200) {
      return {
          statusCode: 200,
          body: {
            wins: ddbResponseWon.Count,
            losses: ddbResponseLost.Count
          }
      };
    } else {
      return {
          statusCode: 404
      }
  }
}