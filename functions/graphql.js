const { createLambdaServer } = require('./bundle/server');

const server = createLambdaServer();

exports.handler = server.createHandler({
	cors: {
		origin: [ 'https://*.organicsk.com', '42.3.205.161' ],
		credentials: true
	}
});
