import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import * as path from 'path';
import { Construct } from 'constructs'
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";

interface LeagueTableStackProps extends StackProps {}

export class LeagueTableStack extends Stack {
	public readonly leagueTable: Table;
    public readonly singlesMatchesTable: Table;
    public readonly getLeaguesLambdaFunction: lambda.Function;

	constructor(scope: Construct, id: string, props: LeagueTableStackProps) {
		super(scope, id, props)

		this.leagueTable = new Table(this, 'LeagueTable', {
			removalPolicy: RemovalPolicy.RETAIN,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: { 
                name: 'leagueId', 
                type: AttributeType.STRING 
            },
		})

        this.singlesMatchesTable = new Table(this, 'SinglesMatchesTable', {
			removalPolicy: RemovalPolicy.RETAIN,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: { 
                name: 'matchId', 
                type: AttributeType.STRING
            },
		})

		this.singlesMatchesTable.addGlobalSecondaryIndex({
			indexName: 'matches-by-cognito-id',
			partitionKey: { 
                name: 'cognitoId-P1', 
                type: AttributeType.STRING 
            },
		})
	}
}