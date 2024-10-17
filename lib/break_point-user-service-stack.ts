import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { UserPoolConstruct } from './constructs/user-pool-construct';
import { UserTableConstruct } from './constructs/user-table-construct';
import { CreateNewUserLambdaConstruct } from './constructs/create-new-user-lambda-construct';
import { ProfilePicS3BucketConstruct } from './constructs/profile-pic-s3-bucket-construct';

export class BreakPointUserServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPoolConstruct = new UserPoolConstruct(this, 'UserPool', {});
    const createNewUserLambdaConstruct = new CreateNewUserLambdaConstruct(this, 'NewUserLambda', {});

    const userTableConstruct = new UserTableConstruct(this, 'UserTable', {
      createNewUserLambdaFunction: createNewUserLambdaConstruct.createNewUserFunction
    });

    const profilePicS3BucketConstruct = new ProfilePicS3BucketConstruct(this, 'ProfilePicS3Bucket', {});
    

    
  }
}
