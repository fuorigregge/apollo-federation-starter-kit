const winston = require('winston');
const { format, transports } = winston;

const defaults = {
    level: 'info',
    service: 'service-name',
    files: {
        combined: 'combined.log',
        error: 'error.log',
        exception: 'exception.log'
    },
    onError: err => { }
};

const defaultsServiceOpts = {
    logLevel: 'info',
    headers: {
        userId: 'x-user-id',
        authToken: 'x-auth-token',
        requestId: 'x-request-id'
    }
}

const logHeadersMeta = (headers, optsHeaders) => {

    const authHeader = headers.get('Authorization');

    let authorization;

    if (!authHeader) {
        authorization = false;
    } else if (authHeader.indexOf('Bearer ') === 0) {
        authorization = 'bearer'
    } else if (authHeader.indexOf('Basic') === 0) {
        authorization = 'basic'
    }

    return {
        'x-user-id': headers.get(optsHeaders.userId),
        'x-auth-token': headers.get(optsHeaders.authToken) ? true : false,
        'x-request-id': headers.get(optsHeaders.requestId),
        'authorization': authorization
    }
}

const consoleFormat = format.printf(info => {
    let gqlMeta = '';
    if (info.metadata.query) {
        gqlMeta = `query:${info.metadata.query.replace('\n', '')} variables:${JSON.stringify(info.metadata.variables)}`;
    }
    return `[${info.timestamp}] ${info.metadata.service} ${info.level}: ${info.message} ${gqlMeta}`
})


const prepareLogger = (options = {}) => {
    const opts = Object.assign({}, defaults, options);
    const logger = winston.createLogger({
        level: opts.level,
        format: format.combine(            
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
            format.json()
        ),
        defaultMeta: { service: opts.service },
        transports: [
            new transports.File({ filename: opts.files.error, level: 'error' }),
            new transports.File({ filename: opts.files.combined })
        ],
        exceptionHandlers: [
            new transports.File({ filename: opts.files.exception })
        ]
    });

    if (opts.level === 'info') {
        logger.add(new transports.Console({
            level: opts.level,
            format: format.combine(
                format.colorize(),
                consoleFormat
            )
        }))
    }

    logger.on('error', opts.onError);

    return logger;
}

/** 
 * @param {*} logger 
 * @param {*} options 
 */
const prepareLoggerServicePlugin = (logger = null, options = {}) => {

    options = Object.assign({}, defaultsServiceOpts, options);

    if (!Object.keys(logger.levels).includes(options.logLevel)) {
        throw new Error(`supported level are ${Object.keys(logger.levels).join(', ')}`)
    }

    const log = logger[options.logLevel];

    if (!logger) {
        throw new Error('Provide a Winston logger instance');
    }

    return {
        requestDidStart({ request, operationName }) {
            const start = Date.now();
            const requestId = request.http.headers.get(options.headers.requestId);
            log(`${requestId ? `[${requestId}]` : '[EXT]'} request ${operationName || ""}`, {
                query: request.query,
                variables: request.variables,
                data: null,
                headers: logHeadersMeta(request.http.headers, options.headers)
            });

            return {
                didEncounterErrors: ({ errors }) => {
                    const f = errors.toString()
                    logger.error(f, {
                        stack: errors.map(e => e.stack)
                    });
                },
                willSendResponse: ({ response, operationName }, ) => {
                    const { data } = response;
                    const strData = JSON.stringify(data);
                    const bytes = Buffer.byteLength(strData, 'utf8')
                    log(`${requestId ? `[${requestId}]` : '[EXT]'} response ${operationName || ""} [B ${bytes}] [ms ${Date.now() - start}]`, { data: strData });
                }
            }
        }
    }
}


module.exports = { prepareLogger, prepareLoggerServicePlugin }