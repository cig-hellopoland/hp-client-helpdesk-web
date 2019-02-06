const mockServer = require('json-server');
const db = require('./db.json');
const rewrites = require('./rewrites');
const routes = require('./routes');

const server = mockServer.create();
const router = mockServer.router(db);
const middlewares = mockServer.defaults();

server.use(middlewares);
server.use(mockServer.bodyParser);
server.use(mockServer.rewriter(rewrites || {}));

routes.forEach(({ method, path, fn }) => server[method](path, fn));

server.use(router);

server.listen(3003, () => {
  console.log('JSON Server is running');
});
