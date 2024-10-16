import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { UserPoolConstruct } from './constructs/user-pool-construct';

export class BreakPointUserServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPoolConstruct = new UserPoolConstruct(scope, id, {});

    

  }
}
