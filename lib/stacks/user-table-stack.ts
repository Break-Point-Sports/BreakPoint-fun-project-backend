import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { UserTableConstruct } from '../constructs/user-table-construct';
import { CreateNewUserLambdaConstruct } from '../constructs/create-new-user-lambda-construct';
import { GetUserDetailsLambdaConstruct } from '../constructs/get-user-details-lambda-construct';

export class UserTableStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const createNewUserLambdaConstruct = new CreateNewUserLambdaConstruct(this, 'NewUserLambda', {});
    const getUserDetailsLambdaConstruct = new GetUserDetailsLambdaConstruct(this, 'UserDetailsLambda', {})

    const userTableConstruct = new UserTableConstruct(this, 'UserTable', {
      createNewUserLambdaFunction: createNewUserLambdaConstruct.createNewUserFunction,
      getUserDetailsLambdaFunction: getUserDetailsLambdaConstruct.getUserDetailsFunction
    });
  }
}
