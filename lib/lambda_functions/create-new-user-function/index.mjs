import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {

    var method = event.requestContext.http.method 
  
    if (method != 'POST'){
        return {
            'statusCode': 405,
        }
    }

    var body = JSON.parse(event.body)
    
    console.log('body: ' + JSON.stringify(body))

    var cognitoId = body['cognitoId']
    var firstName = body['firstName']
    var lastName = body['lastName']
    var birthday = body['birthday']
    var gender = body['gender']
    var tennisLevel = body['tennisLevel']

    console.log('cognitoId: ' + cognitoId)
    console.log('firstName: ' + firstName)
    console.log('lastName: ' + lastName)
    console.log('birthday: ' + birthday)
    console.log('gender: ' + gender)
    console.log('tennisLevel: ' + tennisLevel)


    const command = new PutCommand({
      TableName: "BreakPointUserTable",
      Item: {
        cognitoId: cognitoId,
        firstName: firstName,
        lastName: lastName,
        birthday: birthday,
        gender: gender,
        tennisLevel: tennisLevel
      },
    });

    const ddbResponse = await docClient.send(command);
    
    console.log(ddbResponse)

    var functionResponse = {
      statusCode: 200,
    };

    return functionResponse;
  };