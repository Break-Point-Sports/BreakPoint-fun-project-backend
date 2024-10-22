#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { UserTableStack } from '../lib/stacks/user-table-stack';
import { CognitoStack } from '../lib/stacks/cognito-stack';
import { ProfilePicStack } from '../lib/stacks/profile-pic-stack';

const app = new cdk.App();
new UserTableStack(app, 'BreakPointUserServiceStack', {});
new CognitoStack(app, 'CognitoStack', {})
new ProfilePicStack(app, 'ProfilePicStack', {})
