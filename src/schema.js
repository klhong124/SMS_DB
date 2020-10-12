const { gql } = require('apollo-server-lambda');

module.exports = gql`
	schema {
		query: Query
		mutation: Mutation
	}

	scalar Date
	scalar Token

	type Query {
		user(_id: ID,name:String): User
		users(input:UserInput): [User]
		messagesforTEST:[Message]
	}
	type Mutation {
		login(number:String!,password:String!): Auth
		register(name: String!,password:String!,number:String!): User
		createMessage(sender: Int!,reciever:Int!,content:String!): Message
	}

	type User {
		_id: ID
		name: String
		password:String
		number: Int
		created_at: Date
		updated_at: Date
		last_login: Date
	}

	type Auth {
		token: String
		user: User
	}

	type Message{
		_id: ID
		sender: Int
		reciever: Int
		content: String
		created_at: Date
		is_seen: Boolean
		seen_at: Date
	}

	input UserInput{
		name:String
		number:Int
	}
`;
