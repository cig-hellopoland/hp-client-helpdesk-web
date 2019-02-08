const db = require('./db');

const { users } = db;

module.exports = [
  {
    method: 'post',
    path: '/login',
    fn: (req, res) => {
      const { login, password } = req.body;
      let status = 401;
      let response = {
        errors: [
          {
            status: '401',
            detail: 'Incorrect credentials',
          },
        ],
      };

      const user = users.filter(usr => usr.email === login)[0];

      if (user && user.password === password) {
        status = 200;
        response = {
          data: {
            accessToken: 'qwerty1234567890',
            refreshToken: 'asdfgh0987654321',
          },
        };
      }

      res.status(status).jsonp(response);
    },
  },
  {
    method: 'post',
    path: '/logout',
    fn: (req, res) => {
      res.sendStatus(200);
    },
  },
  {
    method: 'post',
    path: '/refresh',
    fn: (req, res) => {
      const response = {
        data: {
          accessToken: '1234567890qwerty',
          refreshToken: '0987654321asdfgh',
        },
      };

      res.jsonp(response);
    },
  },
];
