import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {

    var method = event.requestContext.http.method 
  
    if (method != 'GET'){
        return {
            'statusCode': 405,
        }
    }

    const isActive = event["queryStringParameters"]['isActive']
    
    console.log("isActive: " + isActive)

    if (!isActive) {
        return {
            'statusCode': 400
        }
    }

    var params = {
        TableName : "BreakPointLeaguesTable",
        IndexName : "leagues-by-is-active",
        KeyConditionExpression: "isActive = :isActive",
        ExpressionAttributeValues: {
            ":isActive": isActive
        }
    };
    
    const command = new QueryCommand(params)

    const ddbResponse = await docClient.send(command);
    
    console.log(ddbResponse)

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