import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { aws_s3 } from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as lambda from "aws-cdk-lib/aws-lambda";

export interface ProfilePicS3BucketConstructProps {
    updateProfilePicLambdaFunction: lambda.Function,
}

export class ProfilePicS3BucketConstruct extends Construct {
    public readonly profilePicS3Bucket: s3.Bucket;

    constructor(scope: Construct, id: string, props: ProfilePicS3BucketConstructProps) {
        super(scope, id);

        this.profilePicS3Bucket = new s3.Bucket(scope, 'ProfilePicBucket', {
            bucketName: 'break-point-profile-pic-bucket',
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            versioned: true,
            removalPolicy: RemovalPolicy.RETAIN,
            cors: [{
                allowedHeaders: ["Authorization","*"],
                allowedOrigins: ["*"],
                allowedMethods: [aws_s3.HttpMethods.HEAD, aws_s3.HttpMethods.GET, aws_s3.HttpMethods.PUT],
                exposedHeaders: [],
                maxAge: 0
            }]
        });

        this.profilePicS3Bucket.grantPut(props.updateProfilePicLambdaFunction)
    }
}