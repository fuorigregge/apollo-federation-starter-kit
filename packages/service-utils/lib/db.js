const { randomString } = require('./string');

const mongoId = () => randomString(17);

module.exports = { mongoId }
