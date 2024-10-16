import { Construct } from 'constructs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from 'path';

export interface CreateNewUserLambdaConstructProps {
    
}

export class CreateNewUserLambdaConstruct extends Construct {
    constructor(scope: Construct, id: string, props: CreateNewUserLambdaConstructProps) {
        super(scope, id);

        const fn = new lambda.Function(this, 'CreateNewUserFunction', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda_functions/create-new-user-function')),
        });
      
        const endpoint = new apigw.LambdaRestApi(this, `ApiGwEndpoint`, {
            handler: fn,
            restApiName: `CreateNewUser`,
        });
    }
}