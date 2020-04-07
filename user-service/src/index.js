const { init } = require('./container')
const { ApolloServer, SchemaDirectiveVisitor } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
const federatedSchema = require('./graphql');
const { EventEmitter } = require('events');
const { asValue } = require('awilix');
const { authDirective } = require('./repo');
const { prepareAuthDirective } = require('@ruzz/graphql-directive-auth')
const { constraint } = require('@ruzz/graphql-directive-constraint')
const { prepareLoggerServicePlugin } = require('@ruzz/service-logger')

const ee = new EventEmitter();
const serverUrl = new URL(process.env.USER_SERVICE_URL)

const run = async container => {

    const logger = container.resolve('logger');

    const schema = buildFederatedSchema(federatedSchema);

    SchemaDirectiveVisitor.visitSchemaDirectives(schema, {
        constraint: constraint,
        auth: prepareAuthDirective(authDirective)
    });

    const server = new ApolloServer({
        schema,
        context: (integrationContext) => {
            container.register('reqHeaders', asValue(integrationContext.req.headers));
            return {
                userRepo: container.resolve('userRepo'),
                authContext: container.resolve('authContext'),
                logger,
                ...integrationContext
            }
        },
        reporting: true,
        plugins: [prepareLoggerServicePlugin(logger, { logLevel: 'info' })]
    });

    server.listen(serverUrl.port).then(({ url }) => {
        logger.info(`🚀 Server ready at ${url}`);
    });
}

ee.on('container.ready', container => run(container))
init(ee)
ee.emit('init');