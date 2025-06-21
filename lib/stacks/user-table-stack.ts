import {StackProps, Stack, } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import {Table, BillingMode, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Function, Runtime, Code, FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import {join} from 'path';
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";

interface UserTableStackProps extends StackProps {
  moveLeagueToPlayoffsLambdaFunction: Function,
  moveLeagueToCurrentLambdaFunction: Function
}

export class UserTableStack extends Stack {

  public readonly getUserDetailsLambdaFunction: Function;
  public readonly createNewUserLambdaFunction: Function;
  public readonly joinLeagueLambdaFunction: Function;
  public readonly joinLadderLambdaFunction: Function;
  public readonly getLeagueMembersFunction: Function;
  public readonly userTable: Table;
  

  constructor(scope: Construct, id: string, props: UserTableStackProps) {
    super(scope, id, props);
    
    // CreateNewUserLambda
    this.createNewUserLambdaFunction = new Function(this, 'CreateNewUserFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset(join(__dirname, '../lambda_functions/create-new-user-function')),
    });

    const createNewUserFunctionURL = this.createNewUserLambdaFunction.addFunctionUrl({
        authType: FunctionUrlAuthType.NONE,
    });

    const createNewUserEndpoint = new LambdaRestApi(this, `ApiGwEndpoint`, {
      handler: this.createNewUserLambdaFunction,
      restApiName: `CreateNewUser`,
      proxy: false
    });

    const createNewUserItems = createNewUserEndpoint.root.addResource('items');
    createNewUserItems.addMethod('POST');


    // GetUserDetailsLambda
    this.getUserDetailsLambdaFunction = new Function(this, 'GetUserDetailsFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset(join(__dirname, '../lambda_functions/get-user-details-function')),
    });

    const getUserDetailsFunctionURL = this.getUserDetailsLambdaFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    const getUserDetailsEndpoint = new LambdaRestApi(this, `GetUserDetailsApiGwEndpoint`, {
      handler: this.getUserDetailsLambdaFunction,
      restApiName: `GetUserDetails`,
      proxy: false
    });

    const getUserDetailsItems = getUserDetailsEndpoint.root.addResource('items');
    getUserDetailsItems.addMethod('GET');


    // Join a league lambda function
    this.joinLeagueLambdaFunction = new Function(this, 'JoinLeagueLambda', {
      functionName: 'JoinLeagueFunction',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset(join(__dirname, '../lambda_functions/join-league-function')),
    })

    const joinLeagueFunctionURL = this.joinLeagueLambdaFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    })

    const joinLeagueFunctionEndpoint = new LambdaRestApi(this, 'JoinLeagueApiGWEndpoint', {
      handler: this.joinLeagueLambdaFunction,
      restApiName: 'JoinLeague',
      proxy: false
    })

    const joinLeagueItems = joinLeagueFunctionEndpoint.root.addResource('items');
    joinLeagueItems.addMethod('POST')

    // Join a ladder lambda function
    this.joinLadderLambdaFunction = new Function(this, 'JoinLadderLambda', {
      functionName: 'JoinLadderFunction',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset(join(__dirname, '../lambda_functions/join-ladder-function')),
    })

    const joinLadderFunctionURL = this.joinLadderLambdaFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    })

    const joinLadderFunctionEndpoint = new LambdaRestApi(this, 'JoinLadderApiGWEndpoint', {
      handler: this.joinLadderLambdaFunction,
      restApiName: 'JoinLadder',
      proxy: false
    })

    const joinLadderItems = joinLadderFunctionEndpoint.root.addResource('items');
    joinLadderItems.addMethod('POST')

    // Query league members lambda function
    this.getLeagueMembersFunction = new Function(this, 'GetLeagueMembersLambda', {
      functionName: 'GetLeagueMembersFunction',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset(join(__dirname, '../lambda_functions/get-league-members-function')),
    })

    const getLeagueMembersFunctionURL = this.getLeagueMembersFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    })

    const getLeagueMembersFunctionEndpoint = new LambdaRestApi(this, 'GetLeagueMembersApiGWEndpoint', {
      handler: this.getLeagueMembersFunction,
      restApiName: 'GetLeagueMembers',
      proxy: false
    })

    const getLeagueMembersItems = getLeagueMembersFunctionEndpoint.root.addResource('items');
    getLeagueMembersItems.addMethod('GET')

    // Create user table
    this.userTable = new Table(this, 'UserTable', {
      tableName: 'BreakPointUserTable',
			billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
          name: 'cognitoId',
          type: AttributeType.STRING
      },
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Add gsi for querying users by current league
    this.userTable.addGlobalSecondaryIndex({
			indexName: 'users-by-current-league',
			partitionKey: { 
        name: 'currentLeague', 
        type: AttributeType.STRING 
      },
		})

    // Add gsi for querying users by future league
    this.userTable.addGlobalSecondaryIndex({
      indexName: 'users-by-future-league',
      partitionKey: { 
        name: 'futureLeague', 
        type: AttributeType.STRING 
      },
    })

    this.userTable.grantFullAccess(this.createNewUserLambdaFunction);
    this.userTable.grantFullAccess(this.joinLeagueLambdaFunction);
    this.userTable.grantFullAccess(this.joinLadderLambdaFunction);
    this.userTable.grantFullAccess(props.moveLeagueToPlayoffsLambdaFunction);
    this.userTable.grantFullAccess(props.moveLeagueToCurrentLambdaFunction);
    this.userTable.grantReadData(this.getUserDetailsLambdaFunction);
    this.userTable.grantReadData(this.getLeagueMembersFunction);
  }
}
