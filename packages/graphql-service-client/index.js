const fetch = require('node-fetch');

const defaultConfig = {
    serviceToken: null,
    headers: {},
    logger: null
}

class ServiceClient {

    constructor(
        service,
        gatewayUrl,
        config = {}
    ) {
        if (!gatewayUrl) throw new Error(`Gateway URL param not provided`);
        if (!service) throw new Error('service id not provided');

        this.service = service;
        this.url = gatewayUrl;
        this.config = Object.assign({}, defaultConfig, config);
    }

    _logHeadersMeta() {

        const authHeader = this.config.headers['Authorization']
        let authorization;
        if (!authHeader) {
            authorization = false;
        } else if (authHeader.indexOf('Bearer') === 0) {
            authorization = 'bearer'
        } else if (authHeader.indexOf('Basic') === 0) {
            authorization = 'basic'
        }

        return {
            'authorization': authorization
        }
    }

    withUser(token) {
        this.config.headers['Authorization'] = `Bearer ${token}`
        return this;
    }

    internal() {
        if (!this.config.serviceToken) throw new Error('Provide a service authorization token for internal call without user reference');
        this.config.headers['x-service-id'] = this.service;
        this.config.headers['Authorization'] = `Basic ${this.config.serviceToken}`
        return this;
    }

    async process(query, variables) {

        if (!this.config.headers['Authorization']) throw new Error('Set Authorization param on header');

        let start = this.config.logger && Date.now();

        const response = await fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.config.headers
            },
            body: JSON.stringify({ query, variables }),
        })

        this.config.logger && this.config.logger.info(`request [INT] [ms ${Date.now() - start}]`, {
            query,
            variables,
            headers: this._logHeadersMeta()            
        })

        return response.json();

    }

}

module.exports = ServiceClient;