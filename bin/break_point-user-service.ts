#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BreakPointUserServiceStack } from '../lib/stacks/break_point-user-service-stack';
import { PROD_AWS_ACCOUNT, PROD_AWS_REGION } from '../lib/util/constants';

const app = new cdk.App();
new BreakPointUserServiceStack(app, 'BreakPointUserServiceStack', {
  env: { account: PROD_AWS_ACCOUNT, region: PROD_AWS_REGION },
});