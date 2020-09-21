
const { startAPM, getAPM } = require('./apm');
startAPM();

const axios = require('axios').default;
const app = require('express')();
const { ApmContext } = require('./apmContext');

function logErrors (err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' });
  } else {
    next(err);
  }
}

function errorHandler (err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

app.get('/healthz', function (req, res) {
  res.send({
    msg: 'OK',
  });
});

app.get('/api/:msg', async function (req, res, next) {
  try {
    const resAll = await Promise.all([
      axios.get('http://apm-nodejs-app-c:8080/api/hello-b-c-1'),
      axios.get('http://apm-nodejs-app-c:8080/api/hello-b-c-2'),
    ]);

    const amp = getAPM();
    const apmContext = new ApmContext();

    // outer span
    const spanOuter = amp.startSpan('outer');

    let num = 0;

    for (let i = 0; i < 1000; i++) {
      for (let j = 0; j < 1000; j++) {
        num += i + j;
      }
    }

    // inner span
    const spanInner = amp.startSpan('inner');

    for (let i = 0; i < 1000; i++) {
      for (let j = 0; j < 1000; j++) {
        num += i + j;
      }
    }

    if (spanInner) {
      spanInner.end();
    }

    // end inner span

    let c3;

    try {
      c3 = await axios.get('http://apm-nodejs-app-c:8080/api/hello-b-c-3');
    }
    catch (e) {
      throw e;
    }
    finally {
      if (spanOuter) {
        spanOuter.end();
      }
    }

    // recover old span
    apmContext.active();

    res.send({
      b: req.params.msg,
      c1: resAll[0].data,
      c2: resAll[1].data,
      c3: c3.data,
    });
  }
  catch (err) {
    next(err);
  }
});

app.listen(8080);
