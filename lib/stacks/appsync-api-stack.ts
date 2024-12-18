import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { UserPool } from 'aws-cdk-lib/aws-cognito'
import * as path from 'path'
import {GraphqlApi, Definition, AuthorizationType, FieldLogLevel, MappingTemplate} from 'aws-cdk-lib/aws-appsync';

interface AppsyncAPIStackProps extends StackProps {
	userpool: UserPool
	roomTable: Table
	userTable: Table
	messageTable: Table
}

export class AppsyncAPIStack extends Stack {
	constructor(scope: Construct, id: string, props: AppsyncAPIStackProps) {
		super(scope, id, props)

		const api = new GraphqlApi(this, 'ChatApp', {
			name: 'ChatApp',
			definition: Definition.fromFile(path.join(__dirname, '../graphql/schema.graphql')),
			authorizationConfig: {
				defaultAuthorization: {
					authorizationType: AuthorizationType.USER_POOL,
					userPoolConfig: {
						userPool: props.userpool,
					},
				},
			},
			logConfig: {
				fieldLogLevel: FieldLogLevel.ALL,
			},
			xrayEnabled: true,
		})

		const roomTableDataSource = api.addDynamoDbDataSource(
			'RoomTableDataSource',
			props.roomTable
		)
		const messageTableDataSource = api.addDynamoDbDataSource(
			'MessageTableDataSource',
			props.messageTable
		)

		roomTableDataSource.createResolver('createRoomResolver', {
			typeName: 'Mutation',
			fieldName: 'createRoom',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(
					__dirname,
					'../graphql/mappingTemplates/Mutation.createRoom.req.vtl'
				)
			),
			responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
		})

		roomTableDataSource.createResolver('listRoomsResolver', {
			typeName: 'Query',
			fieldName: 'listRooms',
			// Can't use MappingTemplate.dynamoDbScanTable() because it's too basic for our needs👇🏽
			// https://github.com/aws/aws-cdk/blob/5e4d48e2ff12a86c0fb0177fe7080990cf79dbd0/packages/%40aws-cdk/aws-appsync/lib/mapping-template.ts#L39. I should PR this to take in an optional limit and scan 🤔
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(__dirname, '../graphql/mappingTemplates/Query.listRooms.req.vtl')
			),
			responseMappingTemplate: MappingTemplate.fromFile(
				path.join(__dirname, '../graphql/mappingTemplates/Query.listRooms.res.vtl')
			),
		})

		messageTableDataSource.createResolver('createMessageResolver', {
			typeName: 'Mutation',
			fieldName: 'createMessage',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(
					__dirname,
					'../graphql/mappingTemplates/Mutation.createMessage.req.vtl'
				)
			),
			responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
		})
		messageTableDataSource.createResolver('listMessagesForRoomResolver', {
			typeName: 'Query',
			fieldName: 'listMessagesForRoom',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(
					__dirname,
					'../graphql/mappingTemplates/Query.listMessagesForRoom.req.vtl'
				)
			),
			responseMappingTemplate: MappingTemplate.fromFile(
				path.join(
					__dirname,
					'../graphql/mappingTemplates/Query.listMessagesForRoom.res.vtl'
				)
			),
		})

		new CfnOutput(this, 'GraphQLAPIURL', {
			value: api.graphqlUrl,
		})

		new CfnOutput(this, 'GraphQLAPIID', {
			value: api.apiId,
		})
	}
}