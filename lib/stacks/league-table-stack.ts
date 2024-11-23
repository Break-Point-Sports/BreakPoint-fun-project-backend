import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { join } from 'path';
import { Construct } from 'constructs'
import { Function, Runtime, Code, FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";

interface LeagueStackProps extends StackProps {}

export class LeagueStack extends Stack {
	public readonly leagueTable: Table;
  public readonly singlesMatchesTable: Table;
  public readonly getLeagueInfoLambdaFunction: Function;
	public readonly getLeaguesLambdaFunction: Function;

	constructor(scope: Construct, id: string, props: LeagueStackProps) {
		super(scope, id, props)

		// Get info for a specific league lambda
		this.getLeagueInfoLambdaFunction = new Function(this, 'GetLeagueInfo', {
			runtime: Runtime.NODEJS_18_X,
			handler: 'index.handler',
			code: Code.fromAsset(join(__dirname, '../lambda_functions/get-league-info-function')),
		});
	
		const getLeagueInfoFunctionURL = this.getLeagueInfoLambdaFunction.addFunctionUrl({
			authType: FunctionUrlAuthType.NONE,
		});
	
		const getLeagueFunctionEndpoint = new LambdaRestApi(this, `ApiGwEndpoint`, {
		handler: this.getLeagueInfoLambdaFunction,
		restApiName: `GetLeagueInfo`,
		proxy: false
		});
	  
		const getLeagueInfoItems = getLeagueFunctionEndpoint.root.addResource('items');
		getLeagueInfoItems.addMethod('GET');

		// Get leagues lambda function based on active status
		this.getLeaguesLambdaFunction = new Function(this, 'GetLeaguesLambda', {
			runtime: Runtime.NODEJS_18_X,
			handler: 'index.handler',
			code: Code.fromAsset(join(__dirname, '../lambda_functions/get-leagues-function')),
		});
	
		const getLeaguesFunctionURL = this.getLeaguesLambdaFunction.addFunctionUrl({
			authType: FunctionUrlAuthType.NONE,
		});
	
		const getLeaguesFunctionEndpoint = new LambdaRestApi(this, `GetLeaguesApiGwEndpoint`, {
		handler: this.getLeagueInfoLambdaFunction,
		restApiName: `GetLeagues`,
		proxy: false
		});
	  
		const getLeaguesItems = getLeaguesFunctionEndpoint.root.addResource('items');
		getLeaguesItems.addMethod('GET');

		// Leagues table
		this.leagueTable = new Table(this, 'LeagueTable', {
			tableName: 'BreakPointLeaguesTable',
			removalPolicy: RemovalPolicy.RETAIN,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: { 
                name: 'leagueId', 
                type: AttributeType.STRING 
            },
		})
		this.leagueTable.grantReadData(this.getLeagueInfoLambdaFunction);
		this.leagueTable.grantReadData(this.getLeaguesLambdaFunction);

		// Singles matches secondary index to search for matches by player (cognito) id
		this.leagueTable.addGlobalSecondaryIndex({
			indexName: 'leagues-by-is-active',
			partitionKey: { 
				name: 'isActive', 
				type: AttributeType.STRING 
			},
		})

		// Singles matches table
        this.singlesMatchesTable = new Table(this, 'BreakPointSinglesMatchesTable', {
			tableName: 'BreakPointSinglesMatchesTable',
			removalPolicy: RemovalPolicy.RETAIN,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: { 
                name: 'matchId', 
                type: AttributeType.STRING
            },
		})

		// Singles matches secondary index to search for matches by player (cognito) id
		this.singlesMatchesTable.addGlobalSecondaryIndex({
			indexName: 'matches-by-cognito-id',
			partitionKey: { 
                name: 'cognitoId-P1', 
                type: AttributeType.STRING 
            },
		})
	}
}