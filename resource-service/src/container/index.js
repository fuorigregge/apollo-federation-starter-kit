const { createContainer, asValue, asFunction } = require('awilix')
const ServiceClient = require('@ruzz/graphql-service-client');
const db = require('./db');
const { Item } = require('../models');
const { itemRepo, authContext } = require('../repo')
const { SERVICE_NAME } = require('../constants');
const { prepareLogger } = require('@ruzz/service-logger');

function init(ee) {
    ee.once('init', () => {

        const logger = prepareLogger({
            service: SERVICE_NAME,
            files: {
                combined: process.env.LOG_COMBINED_FILE,
                error: process.env.LOG_ERROR_FILE,
                exception: process.env.LOG_EXCEPTION_FILE
            }
        });

        ee.on('db.ready', (db) => {
            const container = createContainer();
                       
            try {
                container.register({
                    database: asValue(db),
                    itemRepo: asFunction(itemRepo),
                    authContext: asFunction(authContext),
                    itemModel: asValue(Item),
                    logger: asValue(logger),
                    serviceClient: asValue(new ServiceClient(
                        SERVICE_NAME,
                        process.env.GATEWAY_PRIVATE_URL,
                        {
                            serviceToken: process.env.SERVICE_TOKEN,
                            logger: logger
                        }
                    ))
                });
            } catch (error) {
                logger.info(`container init error ${error.message}`);
            }

            ee.emit('container.ready', container)
        })

        ee.on('db.error', (err) => {
            logger.error(err)
            ee.emit('container.error', err)
        })

        db.connect(ee)

        ee.emit('boot.ready')
    })
}

module.exports = { init }
