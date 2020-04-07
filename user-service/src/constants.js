module.exports = {    
    MAX_LOGIN_ATTEMPTS: 15,
    LOCK_TIME: 5 * 60 * 1000,
    TOKEN_EXPIRES_IN: 60 * 60 * 24 * 365, //seconds
    ROLES: {
        ADMIN: 'ADMIN',
        EDITOR: 'EDITOR',
        USER: 'USER'
    },
    SERVICE_NAME: 'user-service'
}