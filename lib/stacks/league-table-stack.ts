import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import * as path from 'path';
import { Construct } from 'constructs'
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";

interface LeagueStackProps extends StackProps {}

export class LeagueStack extends Stack {
	public readonly leagueTable: Table;
    public readonly singlesMatchesTable: Table;
    public readonly getLeagueInfoLambdaFunction: lambda.Function;

	constructor(scope: Construct, id: string, props: LeagueStackProps) {
		super(scope, id, props)

		// Get league info lambda
		this.getLeagueInfoLambdaFunction = new lambda.Function(this, 'GetLeagueInfo', {
			runtime: lambda.Runtime.NODEJS_18_X,
			handler: 'index.handler',
			code: lambda.Code.fromAsset(path.join(__dirname, '../lambda_functions/get-league-info-function')),
		});
	
		const getLeagueFunctionURL = this.getLeagueInfoLambdaFunction.addFunctionUrl({
			authType: lambda.FunctionUrlAuthType.NONE,
		});
	
		const getLeagueFunctionEndpoint = new apigw.LambdaRestApi(this, `ApiGwEndpoint`, {
		handler: this.getLeagueInfoLambdaFunction,
		restApiName: `GetLeagueInfo`,
		proxy: false
		});
	  
		const getLeagueInfoItems = getLeagueFunctionEndpoint.root.addResource('items');
		getLeagueInfoItems.addMethod('POST');

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
		this.leagueTable.grantReadData(this.getLeagueInfoLambdaFunction)


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