const { createLambdaServer } = require('./bundle/server');

const server = createLambdaServer();

exports.graphql = server.createHandler({
  cors: {
    origin: "*",
    credentials: true
  }
});