import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import {
	Effect,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

interface MessagingTablesStackProps extends StackProps {}

export class MessagingTablesStack extends Stack {
	public readonly roomTable: Table
	public readonly messageTable: Table

	constructor(scope: Construct, id: string, props: MessagingTablesStackProps) {
		super(scope, id, props)

		const roomTable = new Table(this, 'RoomTable', {
			tableName: 'BreakPointRoomTable',
			removalPolicy: RemovalPolicy.RETAIN,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: { name: 'id', type: AttributeType.STRING },
		})

    roomTable.addGlobalSecondaryIndex({
			indexName: 'room-by-owner-id',
			partitionKey: { name: 'ownerId', type: AttributeType.STRING },
			// sortKey: { name: 'createdAt', type: AttributeType.STRING },
		})
    
		const messageTable = new Table(this, 'MessageTable', {
			tableName: 'BreakPointMessageTable',
			removalPolicy: RemovalPolicy.RETAIN,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: { name: 'id', type: AttributeType.STRING },
		})

		messageTable.addGlobalSecondaryIndex({
			indexName: 'messages-by-room-id',
			partitionKey: { name: 'roomId', type: AttributeType.STRING },
			sortKey: { name: 'createdAt', type: AttributeType.STRING },
		})

		const messageTableServiceRole = new Role(this, 'MessageTableServiceRole', {
			assumedBy: new ServicePrincipal('dynamodb.amazonaws.com'),
		})

		messageTableServiceRole.addToPolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: [`${messageTable.tableArn}/index/messages-by-room-id`],
				actions: ['dymamodb:Query'],
			})
		)
		this.roomTable = roomTable
		this.messageTable = messageTable
	}
}