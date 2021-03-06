const agent = require('elastic-apm-node');

/** @type {agent} */
let apm = null;

function startAPM() {
  apm = agent.start({
    ignoreUrls: ['/healthz'],
  });
  return apm;
}

function getAPM() {
  return apm;
}

module.exports = {
  startAPM,
  getAPM,
};
