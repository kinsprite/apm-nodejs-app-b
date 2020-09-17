const axios = require('axios').default;
const apm = require('elastic-apm-node').start({
  ignoreUrls: ['/healthz'],
});

const app = require('express')();

app.get('/healthz', function (req, res) {
  res.send({
    msg: 'OK',
  });
});

app.get('/api/:msg', async function (req, res) {
  const resAll = await Promise.all([
    axios.get('http://apm-nodejs-app-c:8080/api/hello-b-c-1'),
    axios.get('http://apm-nodejs-app-c:8080/api/hello-b-c-2'),
  ]);

  res.send({
    b: req.params.msg,
    c1: resAll[0].data,
    c2: resAll[1].data,
  });
});

app.listen(8080);
