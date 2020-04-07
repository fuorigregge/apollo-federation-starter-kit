//require('dotenv').config()
const { ApolloServer } = require('apollo-server');
const { ApolloGateway } = require('@apollo/gateway');
const { AuthenticatedDataSource, processRequest } = require('./auth');
const { prepareLogger, prepareLoggerServicePlugin } = require('@ruzz/service-logger')
const serverUrl = new URL(process.env.GATEWAY_URL);

const logger = prepareLogger({ service: 'gateway', files: {
    combined: process.env.LOG_COMBINED_FILE,
    error: process.env.LOG_ERROR_FILE,
    exception: process.env.LOG_EXCEPTION_FILE
}});

const loggerPlugin = prepareLoggerServicePlugin(logger);

async function run() {

    const gateway = new ApolloGateway({
        serviceList: [
            { name: 'user-service', url: process.env.USER_SERVICE_PRIVATE_URL },
            { name: 'resource-service', url: process.env.RESOURCE_SERVICE_PRIVATE_URL },
        ],
        buildService({ name, url }) {
            return new AuthenticatedDataSource({ url });
        },
    });

    const server = new ApolloServer({
        gateway,
        subscriptions: false,
        context: ({ req }) => processRequest(req),
        plugins: [loggerPlugin]
    });

    server.listen(serverUrl.port).then(({ url }) => {
        logger.info(`🚀 Server ready at ${url}`);
    });
}

run()