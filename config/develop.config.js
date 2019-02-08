// See https://github.com/zeit/next.js#exposing-configuration-to-the-server--client-side
module.exports = {
  // Will only be available on the server side
  server: {
    apiURL: 'http://localhost:3003/',
    // Set host to 0.0.0.0 to be able access it from other device in the same network.
    // Useful for mobile devices testing during development, not required in production.
    host: '0.0.0.0',
  },
  // Will be available on both server and client
  public: {
    name: 'Default application name',
    axios: {
      baseURL: 'http://localhost:3000/api',
      timeout: 5000, // ms
    },
  },
};
