const { createContainer, asValue, asFunction } = require('awilix')
const db = require('./db');
const { User } = require('../models');
const { prepareLogger } = require('@ruzz/service-logger');
const { userRepo, authContext } = require('../repo')
const { SERVICE_NAME } = require('../constants');

function init(ee) {
    ee.once('init', () => {

        const logger = prepareLogger({
            service: SERVICE_NAME,
            files: {
                combined: process.env.LOG_COMBINED_FILE,
                error: process.env.LOG_ERROR_FILE,
                exception: process.env.LOG_EXCEPTION_FILE
            }
        })

        ee.on('db.ready', db => {

            const container = createContainer();

            container.register({
                database: asValue(db),
                userRepo: asFunction(userRepo),
                authContext: asFunction(authContext),
                userModel: asValue(User),
                logger: asValue(logger)
            });

            ee.emit('container.ready', container)
        })

        ee.on('db.error', (err) => {
            logger.error(err);
            ee.emit('container.error', err)
        })

        db.connect(ee)

        ee.emit('boot.ready')
    })
}

module.exports = { init }
