const express = require('express');
const next = require('next');
const helmet = require('helmet');
const uuidv4 = require('uuid/v4');
const routes = require('./routes');

const port = parseInt(process.env.NODE_PORT, 10) || 3000;
const host = process.env.NODE_HOST || '127.0.0.1'; // https://tinyurl.com/y8nlgmj6
const env = process.env.NODE_ENV;
const dev = env !== 'production';
const app = next({ dev });

const handle = app.getRequestHandler();

let server;

app
  .prepare()
  .then(() => {
    server = express();

    server.use(helmet());

    server.use((req, res, nextMiddleware) => {
      // nonce should be base64 encoded
      res.locals.nonce = Buffer.from(uuidv4()).toString('base64');
      nextMiddleware();
    });

    const getNonce = (req, res) => `'nonce-${res.locals.nonce}'`;

    server.use(helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          getNonce,
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        styleSrc: [
          "'self'",
          'https://fonts.googleapis.com',
          getNonce,
        ],
      },
    }));

    routes.forEach(({ page, path }) => {
      server.get(path, (req, res) => {
        app.render(req, res, page, { ...req.query, ...req.params });
      });
    });

    // Default catch-all handler to allow Next.js to handle all other routes
    server.all('*', (req, res) => handle(req, res));

    server.listen(port, host, (err) => {
      if (err) {
        throw err;
      }

      // eslint-disable-next-line no-console
      console.log(`> Ready on http://${host}:${port} [${env || 'development'}]`);
    });
  })
  .catch((err) => {
    /* eslint-disable no-console */
    console.log('An error occurred, unable to start the server');
    console.log(err);
  });
