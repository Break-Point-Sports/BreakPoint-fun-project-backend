import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { UpdateCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {

  const method = event.requestContext.http.method
  
  if (method != 'POST') {
    return {
      'statusCode': 405
    }
  }

  const body = JSON.parse(event.body)

  const cognitoId = body['cognitoId']
  const leagueId = body['leagueId']
  const currentOrFuture = body['currentOrFuture']

  if (!cognitoId || !leagueId || !currentOrFuture) {
    return {
      'statusCode': 400
    }
  }

  console.log('cognitoId: ' + cognitoId)
  console.log('leagueId: ' + leagueId)
  console.log('currentOrFuture: ' + currentOrFuture)

  let updateExpression;
  if (currentOrFuture === 'current') {
    updateExpression = 'set currentLeague = :leagueId';
  } else if (currentOrFuture === 'future') {
    updateExpression = 'set futureLeague = :leagueId';
  } else {
    return {
      'statusCode': 400
    }
  }

  const command = new UpdateCommand({
    TableName: 'BreakPointUserTable',
    Key: {
      'cognitoId': cognitoId
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: {
      ':leagueId': leagueId,
    }
  })


  const response = await docClient.send(command);

  console.log(response);

  var functionResponse = {
    statusCode: 200,
  };

  return functionResponse;
}