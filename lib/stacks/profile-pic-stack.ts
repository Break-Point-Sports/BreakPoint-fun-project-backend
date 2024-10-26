import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ProfilePicS3BucketConstruct } from '../constructs/profile-pic-s3-bucket-construct';
import { UpdateProfilePicLambdaConstruct } from '../constructs/update-profile-pic-lambda-construct';

export class ProfilePicStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const updateProfilePicLambdaConstruct = new UpdateProfilePicLambdaConstruct(this, 'UpdateProfilePicLambda', {});

    const profilePicS3BucketConstruct = new ProfilePicS3BucketConstruct(this, 'ProfilePicS3Bucket', {
        updateProfilePicLambdaFunction: updateProfilePicLambdaConstruct.updateProfilePicFunction,

    })
  }
}