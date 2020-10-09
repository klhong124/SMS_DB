const { createLocalServer } = require('./bundle/server');

const server = createLocalServer();

exports.handler = server.createHandler({

});
