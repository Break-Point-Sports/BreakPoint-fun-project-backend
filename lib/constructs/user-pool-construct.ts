import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export interface UserPoolConstructProps {

}

export class UserPoolConstruct extends Construct {
    constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
        super(scope, id);

        const userPool = new cognito.UserPool(this, 'BPUserPool', {
            userPoolName: 'BPUserPool',
            selfSignUpEnabled: true,
            userVerification: {
                smsMessage: 'Thanks for signing up for BreakPoint! Your verification code is {####}.',
            },
            signInAliases: {
                phone: true,
            },
            autoVerify: {
                phone: true,
            },
            mfa: cognito.Mfa.REQUIRED,
            mfaSecondFactor: {
                sms: true,
                otp: false,
            },
            passwordPolicy: {
                minLength: 8,
            },
        })
    }
}