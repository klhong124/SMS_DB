const ApolloServer = require('apollo-server').ApolloServer;
const ApolloServerLambda = require('apollo-server-lambda').ApolloServer;

const typeDefs = require('./schema.js');
const resolvers = require('./resolvers.js');

function createLambdaServer() {
	return new ApolloServerLambda({
		typeDefs,
		resolvers,
		introspection: true,
		playground: {
			settings: {
			"request.credentials": "same-origin"
			}
		}
	});
}

function createLocalServer() {
	return new ApolloServer({
		typeDefs,
		resolvers,
		introspection: true,
		playground: true
	});
}

module.exports = { createLambdaServer, createLocalServer };
