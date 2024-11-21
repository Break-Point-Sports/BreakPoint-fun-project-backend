import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {

    var method = event.requestContext.http.method 
  
    if (method != 'GET'){
        return {
            'statusCode': 405,
        }
    }
    
    const leagueId = event["queryStringParameters"]['leagueId']

    console.log('leagueId: ' + leagueId)

    if (!leagueId) {
        return {
            'statusCode': 400
        }
    }

    const command = new GetCommand({
        TableName: "BreakPointLeaguesTable",
        Key: {
            'leagueId': leagueId
        },
        ConsistentRead: true,
    });

    const ddbResponse = await docClient.send(command);
    
    console.log(ddbResponse)

    let functionResponse;

    if (ddbResponse.Item) {
        functionResponse = {
            statusCode: 200,
            body: ddbResponse.Item
        };
    } else {
        functionResponse = {
            statusCode: 404
        }
    }


    return functionResponse;
  };