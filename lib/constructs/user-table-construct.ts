import { RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from 'constructs';

export interface UserTableConstructProps {
    createNewUserLambdaFunction: lambda.Function,
}

export class UserTableConstruct extends Construct {

    constructor(scope: Construct, id: string, props: UserTableConstructProps) {
        super(scope, id);

        const userTable = new dynamodb.Table(this, 'UserTable', {
            tableName: 'BreakPointUserTable',
            partitionKey: {
                name: 'cognitoID',
                type: dynamodb.AttributeType.STRING
            },
            removalPolicy: RemovalPolicy.RETAIN,
        });

        userTable.grantFullAccess(props.createNewUserLambdaFunction);
    }
}