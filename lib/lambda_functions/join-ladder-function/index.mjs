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
  const ladderId = body['ladderId']

  if ( !cognitoId || !ladderId ) {
    return {
      'statusCode': 400
    }
  }

  console.log('cognitoId: ' + cognitoId)
  console.log('ladderId: ' + ladderId)

  const command = new UpdateCommand({
    TableName: 'BreakPointUserTable',
    Key: {
      'cognitoId': cognitoId
    },
    UpdateExpression: 'set currentLadder = :ladderId',
    ExpressionAttributeValues: {
      ':ladderId': ladderId,
    }
  })


  const response = await docClient.send(command);

  console.log(response);

  var functionResponse = {
    statusCode: 200,
  };

  return functionResponse;
}