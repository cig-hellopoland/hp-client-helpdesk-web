// See https://github.com/zeit/next.js#exposing-configuration-to-the-server--client-side
module.exports = {
  // Will only be available on the server side
  server: {
    apiURL: 'https://hpl.fream.pl/api/v1/helpdesk',
    // Set host to 0.0.0.0 to be able access it from other device in the same network.
    // Useful for mobile devices testing during development, not required in production.
    host: '0.0.0.0',
  },
  // Will be available on both server and client
  public: {
    name: 'Hello! Poland - Help Desk',
    axios: {
      baseURL: 'http://localhost:3000/api',
    },
    iconBaseURL: 'https://hpl.fream.pl/static/icons',
  },
};
