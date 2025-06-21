import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {

    var method = event.requestContext.http.method 
  
    if (method != 'GET'){
        return {
            statusCode: 405,
        }
    }

    const league = event['queryStringParameters']['league']
    const whichLeague = event["queryStringParameters"]['whichLeague']
    
    console.log("league: " + league)
    console.log("whichLeague: " + whichLeague)

    if (!league || (whichLeague !== 'futureLeague' && whichLeague !== 'currentLeague')) {
        return {
            statusCode: 400
        }
    }

    let params;

    if (whichLeague === 'currentLeague') {
      params = {
          TableName : "BreakPointUserTable",
          IndexName : "users-by-current-league",
          KeyConditionExpression: "currentLeague = :currentLeague",
          ExpressionAttributeValues: {
              ":currentLeague": league
          }
      };
    } else {
      params = {
        TableName : "BreakPointUserTable",
        IndexName : "users-by-future-league",
        KeyConditionExpression: "futureLeague = :futureLeague",
        ExpressionAttributeValues: {
            ":futureLeague": league
        }
      }
    }
    
    const command = new QueryCommand(params)

    const ddbResponse = await docClient.send(command);
    
    console.log("ddbResponse: " + ddbResponse)

    let functionResponse;

    if (ddbResponse.Items) {
        functionResponse = {
            statusCode: 200,
            body: ddbResponse.Items
        };
    } else {
        functionResponse = {
            statusCode: 404
        }
    }


    return functionResponse;
  };