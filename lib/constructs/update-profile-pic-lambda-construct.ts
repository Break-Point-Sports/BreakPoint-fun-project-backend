import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from 'path';

export interface UpdateProfilePicLambdaConstructProps {
    
}

export class UpdateProfilePicLambdaConstruct extends Construct {

    public readonly updateProfilePicFunction: lambda.Function;
    
    constructor(scope: Construct, id: string, props: UpdateProfilePicLambdaConstructProps) {
        super(scope, id);

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
    }
}