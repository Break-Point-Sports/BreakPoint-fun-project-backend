import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class CognitoStack extends cdk.Stack {
    public readonly userPool: cognito.UserPool;
    public readonly userPoolClient: cognito.UserPoolClient;
    public readonly identityPool: cognito.CfnIdentityPool;


    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
  
        this.userPool = new cognito.UserPool(this, 'BPUserPool', {
            userPoolName: 'BPUserPool',
            selfSignUpEnabled: true,
            passwordPolicy: {
                minLength: 8,
            },
            signInAliases: {
                phone: true,
            },
            // userVerification: {
            //     smsMessage: 'Thanks for signing up for BreakPoint! Your verification code is {####}.',
            // },

            // autoVerify: {
            //     phone: true,
            // },
            // mfa: cognito.Mfa.REQUIRED,
            // mfaMessage: 'Your BreaKPoint authentication code is {####}.',
            // mfaSecondFactor: {
            //     sms: true,
            //     otp: false,
            // },

        })
        
        this.userPoolClient = new cognito.UserPoolClient(this, "BPUserPoolClient", {
            userPool: this.userPool,
            generateSecret: false,
            // Remove authflows after setting up mfa
            authFlows: {
                userPassword: true,
              },
        });

        this.identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
            identityPoolName: "BPIdentityPool",
            allowUnauthenticatedIdentities: false, // Don't allow unathenticated users
            cognitoIdentityProviders: [
                {
                    clientId: this.userPoolClient.userPoolClientId,
                    providerName: this.userPool.userPoolProviderName,
                },
            ],
        });

        // Export values
        new cdk.CfnOutput(this, "UserPoolId", {
            value: this.userPool.userPoolId,
        });
        new cdk.CfnOutput(this, "UserPoolClientId", {
            value: this.userPoolClient.userPoolClientId,
        });
        new cdk.CfnOutput(this, "IdentityPoolId", {
            value: this.identityPool.ref,
        });
    }
  }
  