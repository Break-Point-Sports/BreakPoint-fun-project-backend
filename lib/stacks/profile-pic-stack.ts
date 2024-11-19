import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from 'path';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';
import { aws_s3 } from 'aws-cdk-lib';

export class ProfilePicStack extends cdk.Stack {
  public readonly updateProfilePicFunction: lambda.Function;
  public readonly profilePicS3Bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.updateProfilePicFunction = new lambda.Function(this, 'UpdateProfilePicFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda_functions/update-profile-pic-function')),
    });

    const functionURL = this.updateProfilePicFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    // Define a CloudFormation output for your URL
    new cdk.CfnOutput(this, "UpdateProfilePicFunctionOutput", {
      value: functionURL.url,
    });

    const endpoint = new apigw.LambdaRestApi(this, `UpdateProfilePicApiGwEndpoint`, {
      handler: this.updateProfilePicFunction,
      restApiName: `UpdateProfilePic`,
      proxy: false
    });

    const items = endpoint.root.addResource('items');
    items.addMethod('POST');

    this.profilePicS3Bucket = new s3.Bucket(this, 'ProfilePicBucket', {
      bucketName: 'break-point-profile-pic-bucket',
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      publicReadAccess: true,
      blockPublicAccess: {
          blockPublicPolicy: false,
          blockPublicAcls: false,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
      },
      removalPolicy: RemovalPolicy.RETAIN,
      cors: [{
          allowedHeaders: ["Authorization","*"],
          allowedOrigins: ["*"],
          allowedMethods: [aws_s3.HttpMethods.HEAD, aws_s3.HttpMethods.GET, aws_s3.HttpMethods.PUT],
          exposedHeaders: [],
          maxAge: 0
      }]
    });

    this.profilePicS3Bucket.grantPut(this.updateProfilePicFunction)
  }
}