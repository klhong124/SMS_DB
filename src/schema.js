const { gql } = require('apollo-server-lambda');

module.exports = gql`
	schema {
		query: Query
		mutation: Mutation
	}

	scalar Date
	scalar Token

	type Query {
		user(_id: ID!): User
		conversations(user_id: ID!):[Conversation]
		conversation(_id:ID!,user_id: ID!):Conversation
	}
	type Mutation {
		login(number:String!,password:String!): Auth
		register(name: String!,password:String!,number:String!): User
		createMessage(target:String!,author: String!,content:String!): Message
		deleteMessage(_id:ID!,user_id:ID!): Boolean
		deleteUser(_id:ID!,password:String!):Boolean
		deleteConversation(_id:ID!,user_id:ID!): Boolean
	}

	type User {
		_id: ID
		name: String
		password:String
		number: String
		created_at: Date
		updated_at: Date
		last_login: Date
		is_deleted:Boolean
	}

	type Auth {
		token: String
		user: User
	}

	type Conversation{
		_id:ID
		is_deleted:[ID]
		participants:[String]
		messages:[Message]
	}

	type Message{
		_id:ID
		author: String
		content: String
		created_at: Date
		is_deleted:[ID]
		is_seen: [MessageSeen]
	}
	
	type MessageSeen{
		user_id:ID
		seen_at:Date
	}
`;
