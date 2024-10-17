import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface ProfilePicS3BucketConstructProps {

}

export class ProfilePicS3BucketConstruct extends Construct {
    constructor(scope: Construct, id: string, props: ProfilePicS3BucketConstructProps) {
        super(scope, id);

        const pofilePicS3Bucket = new s3.Bucket(scope, 'ProfilePicBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            versioned: true,
            removalPolicy: RemovalPolicy.RETAIN,
        });
    }
}