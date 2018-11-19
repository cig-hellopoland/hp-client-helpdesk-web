Template project for web applications.

[CHANGELOG](./CHANGELOG.md)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Demo](#demo)
  - [Run locally](#run-locally)
- [Overview](#overview)
  - [Project structure](#project-structure)
  - [App config](#app-config)
    - [Structure:](#structure)
    - [Usage:](#usage)
    - [Production](#production)
- [Initializing new project](#initializing-new-project)
- [Project stack](#project-stack)
  - [Core packages](#core-packages)
  - [Other common libraries](#other-common-libraries)
- [Using HTTPClient](#using-httpclient)
  - [HTTPClient Interceptors](#httpclient-interceptors)
    - [Examples](#examples)
- [Modifying `next.config.js`](#modifying-nextconfigjs)
  - [Adding new plugins](#adding-new-plugins)
- [Content Security Policy](#content-security-policy)
- [Custom proxy](#custom-proxy)
- [Testing](#testing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Demo

### Run locally

Checkout repo locally.

Install dependencies:
```
npm i
```

Run local server:
```
npm run dev
```

Run mock data server:
```
npm run server-mock
```

Go to `localhost:3000`.

## Overview
### Project structure

```
/components - global components directory (used by more than one view)
  /ExampleComponent
    /__mocks__ - mock data used in tests
    /redux - component reducers
    index.jsx - exports component
    ExampleComponent.jsx - implementation of main component
    ExampleComponent.test.jsx - all kinds of tests
    ExampleButton.jsx - partial component
    ExampleButton.test.jsx
/config - default app configuration
/pages - next.js magic folder. Handles routing. Use [kebab-kase](http://wiki.c2.com/?KebabCase) naming convention.
  /account
    index.jsx - redirects to profile.jsx (preferably with 302 status)
    profile.jsx
    edit.jsx
  /movies
    index.jsx - resolves list and item routes (/movies - list view, /movies/:id - item view)
    add.jsx
    edit.jsc
  example-view.jsx
/redux - global reducers
/scripts - build scripts
/services - application services
/static - static files
  /images
  manifest.json - PWA manifest
/utils - pure JS utility functions
/views - view implamentations
  /ExampleView
    /components - view specific components
    /redux - component reducers
    index.jsx - exports view
    ExampleView.jsx - view implementation
.editorconfig - common editor settings
.eslintrc.json - linter configuration
.gitignore - files ignored by git
.gitlab-cu.yml - CI/CD configuration file - see https://docs.gitlab.com/ce/ci/yaml/
.npmrc - npm configuration
next.config.js - next.js configuration
```

### App config
Default development config is located in `config/develop.config.js`.

#### Structure:
```javascript
{
  // Will only be available on the server side
  server: {
    secret: 'my-secret'
  },
  // Will be available on both server and client
  public: {
    name: 'Default application name',
    axios: {
      baseURL: '/'
    }
  }
}
```
See [Next.js docs](https://github.com/zeit/next.js#exposing-configuration-to-the-server--client-side) for more info.

#### Usage:
```javascript
import config from 'config';

const { secret } = config.server;
const { name } = config.public;
```

#### Production
Usually, different configs are used for production and development.
By default, development config is used.
To override it, pass `CONFIG_PATH` variable to `npm start` script:
```bash
CONFIG_PATH='./path-to-prod-config/config.js' npm run start
```
:warning: Remember to restart app after config changes.

## Initializing new project
To initialize new project using this repository click the "New project" button available in group directory. Next go to "Import project" tab and click "Repo by URL" button.

In "Git repository URL" paste the following URL:

```
git@git.fream.pl:fream/web/react-web-app.git
```

and specify new project path and name (use [kebab-case](http://wiki.c2.com/?KebabCase) convention). 

## Project stack
### Core packages
- `react`
- `next`
- `redux` + `react-redux`
- `redux-logic`
- `express`

### Other common libraries
- `material-ui` v1 (with JSS)
- `axios`
- `jest`

## Using HTTPClient
By default we use [axios](https://github.com/axios/axios) for request handling. It consists of two classes:
- axiosCommons, which provides common methods that can be used depending on project requirements
- httpClient, which configures axios instance

### HTTPClient Interceptors
Interceptors can be added through `requestInterceptors` and `responseInterceptors` maps. Each has the same schema, that is:
- `resolve` - method used by interceptor when request succeeds
- `reject` - method used by interceptor when request fails
- `redux` - used for passing redux action creators

First two keys are mandatory.

#### Examples

1. Logging requests in browser console:
    ```javascript
    import { interceptors } from 'utils/axiosCommons';
    
    const {
      errorLogInterceptor,
      responseLogInterceptor,
      requestLogInterceptor,
    } = interceptors;
 
    const requestInterceptors = [
     {
       reject: errorLogInterceptor('[Request Error]'),
       resolve: requestLogInterceptor,
     },
    ];
    
    const responseInterceptors = [
     {
       reject: errorLogInterceptor('[Response Error]'),
       resolve: responseLogInterceptor,
     },
    ];
    ```
2. Adding JWT support:
    ```javascript
    import { interceptors } from 'utils/axiosCommons';
    import {
      actions as profileActions,
      selectors as profileSelectors,
    } from 'redux/profile';
 
    const {
     errorInterceptor,
     JWTHTTPUnauthorizedInterceptor,
     JWTInterceptor,
    } = interceptors;
    
    
    const requestInterceptors = [
     {
       redux: {
         selectors: profileSelectors,
       },
       reject: errorInterceptor,
       resolve: JWTInterceptor,
     },
    ];
    
    const responseInterceptors = [
     {
       redux: {
         actions: profileActions,
         selectors: {
           ...profileSelectors,
         },
       },
       reject: JWTHTTPUnauthorizedInterceptor,
       resolve: response => response,
     },
    ];   
    ```

## Modifying `next.config.js`

### Adding new plugins

Example:

```diff
const withPlugins = require('next-compose-plugins');
const bundleAnalyzer = require('@zeit/next-bundle-analyzer');
+ const css = require('@zeit/next-css');

...

module.exports = withPlugins([
  [bundleAnalyzer, bundleAnalyzerConfig],
+ [css],
  nextConfig,
]);

```

## Content Security Policy

This project supports CSP out of the box, but it's disabled by default.
In order to enable CSP, set [helmetMiddleware `csp` option to `true`](./server/server.js#L22):

```javascript
helmetMiddleware(server, { csp: true });
```

CSP directives can be found [here](./server/helmet.js#L23).

About CSP: https://helmetjs.github.io/docs/csp/.

## Custom proxy

We use `http-proxy-middleware` for proxying API requests in dev environment to avoid CORS errors.
Note, that only works in dev mode. In production you should usually configure proxy in Nginx/Apache.

Proxy config is located in `server/proxy.js`. Feel free to customize `proxySettings` to match your project needs ;)

## Testing

We use [`jest`](https://jestjs.io/) as our test runner.
Tests are running with npm `test` script:

```
npm run test
```

For testing React components we use [`react-testing-library`](https://github.com/kentcdodds/react-testing-library).
An example test can be found [here](./components/Layout/Header.test.jsx).
