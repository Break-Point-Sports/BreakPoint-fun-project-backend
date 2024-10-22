import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from 'path';

export interface GetUserDetailsLambdaConstructProps {
    
}

export class GetUserDetailsLambdaConstruct extends Construct {

    public readonly getUserDetailsFunction: lambda.Function;
    
    constructor(scope: Construct, id: string, props: GetUserDetailsLambdaConstructProps) {
        super(scope, id);

        this.getUserDetailsFunction = new lambda.Function(this, 'GetUserDetailsFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda_functions/get-user-details-function')),
        });

        const functionURL = this.getUserDetailsFunction.addFunctionUrl({
            authType: lambda.FunctionUrlAuthType.NONE,
        });

        // Define a CloudFormation output for your URL
        new cdk.CfnOutput(this, "GetUserDetailsFunctionOuput", {
            value: functionURL.url,
        });

        const endpoint = new apigw.LambdaRestApi(this, `GetUserDetailsApiGwEndpoint`, {
            handler: this.getUserDetailsFunction,
            restApiName: `GetUserDetails`,
            proxy: false
        });

        const items = endpoint.root.addResource('items');
        items.addMethod('GET');
    }
}