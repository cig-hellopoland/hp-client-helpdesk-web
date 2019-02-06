module.exports = [
  {
    method: 'post',
    path: '/login',
    fn: (req, res) => {
      const credentials = {
        accessToken: 'qwerty1234567890',
        refreshToken: 'asdfgh0987654321',
      };

      res.jsonp(credentials);
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
      const credentials = {
        accessToken: '1234567890qwerty',
        refreshToken: '0987654321asdfgh',
      };

      res.jsonp(credentials);
    },
  },
];
