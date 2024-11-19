import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from 'path';
import * as apigw from "aws-cdk-lib/aws-apigateway";

export class UserTableStack extends cdk.Stack {

  public readonly getUserDetailsLambdaFunction: lambda.Function;
  public readonly createNewUserLambdaFunction: lambda.Function;
  public readonly userTable: dynamodb.Table;
  

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // CreateNewUserLambda
    this.createNewUserLambdaFunction = new lambda.Function(this, 'CreateNewUserFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda_functions/create-new-user-function')),
    });

    const createNewUserFunctionURL = this.createNewUserLambdaFunction.addFunctionUrl({
        authType: lambda.FunctionUrlAuthType.NONE,
    });

    const createNewUserEndpoint = new apigw.LambdaRestApi(this, `ApiGwEndpoint`, {
      handler: this.createNewUserLambdaFunction,
      restApiName: `CreateNewUser`,
      proxy: false
    });

    const createNewUserItems = createNewUserEndpoint.root.addResource('items');
    createNewUserItems.addMethod('POST');


    // GetUserDetailsLambda
    this.getUserDetailsLambdaFunction = new lambda.Function(this, 'GetUserDetailsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda_functions/get-user-details-function')),
    });

    const getUserDetailsFunctionURL = this.getUserDetailsLambdaFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    const getUserDetailsEndpoint = new apigw.LambdaRestApi(this, `GetUserDetailsApiGwEndpoint`, {
      handler: this.getUserDetailsLambdaFunction,
      restApiName: `GetUserDetails`,
      proxy: false
    });

    const getUserDetailsItems = getUserDetailsEndpoint.root.addResource('items');
    getUserDetailsItems.addMethod('GET');


    this.userTable = new dynamodb.Table(this, 'UserTable', {
      tableName: 'BreakPointUserTable',
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
          name: 'cognitoId',
          type: dynamodb.AttributeType.STRING
      },
      removalPolicy: RemovalPolicy.RETAIN,
    });

    this.userTable.addGlobalSecondaryIndex({
			indexName: 'users-by-current-league',
			partitionKey: { 
        name: 'currentLeague', 
        type: dynamodb.AttributeType.STRING 
      },
		})

    this.userTable.grantFullAccess(this.createNewUserLambdaFunction);
    this.userTable.grantReadData(this.getUserDetailsLambdaFunction);
  }
}
