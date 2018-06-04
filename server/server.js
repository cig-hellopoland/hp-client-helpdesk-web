const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const pathMatch = require('path-match');
const routes = require('./routes');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const route = pathMatch();

const match = (function mapRoutesToMatches(routeDefs) {
  const matches = routeDefs.map(pathname => route(pathname));

  return function matchPathname(pathname) {
    const params = matches.filter(r => r(pathname) !== false);

    return params.length > 0 ? params[0](pathname) : false;
  };
}(routes));

function parseURL(pathname, params) {
  return pathname.substring(0, pathname.indexOf(`/${params.id}`));
}

app.prepare()
  .then(() => {
    createServer((req, res) => {
      const { pathname, query } = parse(req.url, true);
      const params = match(pathname);

      if (params === false) {
        handle(req, res);
        return;
      }

      // assigning `query` into the params means that we still
      // get the query string passed to our application
      // i.e. /blog/foo?show-comments=true
      //
      // complex path names cant use REST-like convention (ie. /blog/:id/edit)
      // and should be created like the following: /blog/edit/:id
      app.render(req, res, parseURL(pathname, params), Object.assign(params, query));
    })
      .listen(port, (err) => {
        if (err) {
          throw err;
        }

        // eslint-disable-next-line no-console
        console.log(`> Ready on http://localhost:${port}`);
      });
  });
