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
    var phoneNumber = body['phoneNumber']
    var email = body['email']
    var firstName = body['firstName']
    var lastName = body['lastName']
    var birthday = body['birthday']
    var gender = body['gender']
    var tennisLevel = body['tennisLevel']
    var city = body['city']

    if (!cognitoId || !phoneNumber || !email || !firstName || !lastName || !birthday || !gender || !tennisLevel || !city) {
      return {
        'statusCode': 400
      }
    }

    console.log('cognitoId: ' + cognitoId)
    console.log('phoneNunmber' + phoneNumber)
    console.log('email: ' + email)
    console.log('firstName: ' + firstName)
    console.log('lastName: ' + lastName)
    console.log('birthday: ' + birthday)
    console.log('gender: ' + gender)
    console.log('city: ' + city)
    console.log('tennisLevel: ' + tennisLevel)


    const command = new PutCommand({
      TableName: "BreakPointUserTable",
      Item: {
        cognitoId: cognitoId,
        phoneNumber: phoneNumber,
        email: email,
        firstName: firstName,
        lastName: lastName,
        birthday: birthday,
        gender: gender,
        city: city,
        tennisLevel: tennisLevel,
        futureLeague: 'none',
        currentLeague: 'none',
        playoffLeague: 'none',
        currentLadder: 'none',
        pastLeagues: []
      },
    });

    const ddbResponse = await docClient.send(command);
    
    console.log(ddbResponse)

    var functionResponse = {
      statusCode: 200,
    };

    return functionResponse;
  };