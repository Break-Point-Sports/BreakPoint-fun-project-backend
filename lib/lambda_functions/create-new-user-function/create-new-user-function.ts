exports.handler = async (event) => {

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

    var response = {
      statusCode: 200,
    };

    return response;
  };