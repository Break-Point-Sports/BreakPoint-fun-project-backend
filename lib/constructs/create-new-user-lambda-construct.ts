import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from 'path';

export interface CreateNewUserLambdaConstructProps {
    
}

export class CreateNewUserLambdaConstruct extends Construct {

    public readonly createNewUserFunction: lambda.Function;
    
    constructor(scope: Construct, id: string, props: CreateNewUserLambdaConstructProps) {
        super(scope, id);

        this.createNewUserFunction = new lambda.Function(this, 'CreateNewUserFunction', {
            runtime: lambda.Runtime.NODEJS_LATEST,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda_functions/create-new-user-function')),
        });

        const functionURL = this.createNewUserFunction.addFunctionUrl({
            authType: lambda.FunctionUrlAuthType.NONE,
        });

          // Define a CloudFormation output for your URL
        new cdk.CfnOutput(this, "myFunctionUrlOutput", {
            value: functionURL.url,
        });

        const endpoint = new apigw.LambdaRestApi(this, `ApiGwEndpoint`, {
            handler: this.createNewUserFunction,
            restApiName: `CreateNewUser`,
            proxy: false
        });

        const items = endpoint.root.addResource('items');
        items.addMethod('POST');
    }
}