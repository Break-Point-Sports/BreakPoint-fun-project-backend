#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { UserTableStack } from '../lib/stacks/user-table-stack';
import { CognitoStack } from '../lib/stacks/cognito-stack';
import { ProfilePicStack } from '../lib/stacks/profile-pic-stack';
import { MessagingTablesStack } from '../lib/stacks/messaging-tables-stack';
import { AppsyncAPIStack } from '../lib/stacks/appsync-api-stack';
import { LeagueStack } from '../lib/stacks/league-table-stack';

const app = new cdk.App();
const leagueStack = new LeagueStack(app, 'LeagueStack', {})
const userTableStack = new UserTableStack(app, 'UserTableStack', {});
const cognitoStack = new CognitoStack(app, 'CognitoStack', {});
const profilePicStack = new ProfilePicStack(app, 'ProfilePicStack', {});
const messagingTablesStack = new MessagingTablesStack(app, 'MessagingTablesStack', {});
const appSyncAPIStack = new AppsyncAPIStack(app, 'AppsyncAPIStack', {
    userpool: cognitoStack.userPool,
    userTable: userTableStack.userTable,
    roomTable: messagingTablesStack.roomTable,
    messageTable: messagingTablesStack.messageTable
})
