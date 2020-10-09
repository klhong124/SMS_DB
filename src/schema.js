const { gql } = require('apollo-server-lambda');

module.exports = gql`
	schema {
		query: Query
		mutation: Mutation
	}

	scalar Date

	type Query {
		user(_id: ID,name:String): User
		users(command:UserInput): [User]
	}
	type Mutation {
		createUser(name: String!,password:String!,number:Int!): User
		createMessage(sender: Int!,reciever:User!,content:String!): User
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

	type Message{
		_id: ID
		sender: Int
		reciever: User
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
