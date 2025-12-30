module.exports = {
  server: {
    apiURL: 'https://hpl.fream.pl/api/v1/helpdesk',
    host: '0.0.0.0',
    // apiIconsURL: 'https://hpl.fream.pl/static/icons', // możesz zostawić lub usunąć
  },
  public: {
    name: 'Hello! Poland - Help Desk',
    brandName: 'Hello! Poland',
    axios: {
      baseURL: 'http://localhost:3000/api',
    },
    iconBaseURL: 'https://hpl.fream.pl/static/icons',
  },
};
