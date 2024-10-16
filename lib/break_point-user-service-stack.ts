import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { UserPoolConstruct } from './constructs/user-pool-construct';
import { UserTableConstruct } from './constructs/user-table-construct';
import { CreateNewUserLambdaConstruct } from './constructs/create-new-user-lambda-construct';

export class BreakPointUserServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPoolConstruct = new UserPoolConstruct(this, 'UserPool', {});
    const userTableConstruct = new UserTableConstruct(this, 'UserTable', {})
    const createNewUserLambdaConstruct = new CreateNewUserLambdaConstruct(this, 'NewUserLambda', {})

  }
}
