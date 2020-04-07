const itemRepo = require('./item');
const authContext = require('./authContext');
const authDirective = require('./authDirective');

module.exports = Object.create({ itemRepo, authContext, authDirective });