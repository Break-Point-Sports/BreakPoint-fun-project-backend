import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface UserTableConstructProps {

}

export class UserTableConstruct extends Construct {
    constructor(scope: Construct, id: string, props: UserTableConstructProps) {
        super(scope, id);

        const userTable = new dynamodb.Table(this, 'UserTable', {
            partitionKey: {
                name: 'cognitoID',
                type: dynamodb.AttributeType.STRING
            }
        })
    }
}