// const { createLambdaServer } = require('./bundle/server');

// const server = createLambdaServer();

// exports.handler = server.createHandler({

// });

const { createLocalServer } = require('./bundle/server');

const server = createLocalServer();

server.listen().then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`);
});
