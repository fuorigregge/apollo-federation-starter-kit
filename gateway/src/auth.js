const { RemoteGraphQLDataSource } = require("@apollo/gateway");
const jwt = require('jsonwebtoken');
const { randomString } = require('@ruzz/service-utils')

const processAuthToken = (headers) => {
    if (headers.authorization) {
        if (headers.authorization.indexOf('Bearer') === 0) {
            const token = headers.authorization.replace('Bearer ', '');
            return {
                type: 'external',
                token: token,
                payload: {
                    ...jwt.verify(token, process.env.JWT_SECRET, { algorithms: process.env.JWT_ALGORITHM })
                }
            }
        }
    }
    return { type: null, token: null, payload: null };
}

const processRequest = (req) => processAuthToken(req.headers)

class AuthenticatedDataSource extends RemoteGraphQLDataSource {

    willSendRequest({ request, context }) {
        request.http.headers.set('x-request-id', randomString(10))
        if (context.payload) {
            request.http.headers.set('x-user-id', context.payload.userId);
            request.http.headers.set('x-auth-token', context.token);
        }
    }
}

module.exports = { AuthenticatedDataSource, processRequest };