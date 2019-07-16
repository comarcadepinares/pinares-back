'use strict'

const ExceptionPool = require('express-deliver').ExceptionPool

const exceptionPool = new ExceptionPool({
    NotFoundError: {
        code: 404,
        message: 'Route not found',
        statusCode: 404
    },
    ValidationFailed: {
        code: 1001,
        message: 'Authentication failed',
        statusCode: 403
    },
    ValidationPublicKeyFailed: {
        code: 1002,
        message: 'Authentication failed',
        statusCode: 403
    },
    ValidationTokenExpired: {
        code: 1004,
        message: 'Token expired',
        statusCode: 403
    },
    ValidationEmail: {
        code: 1005,
        message: 'Invalid email',
        statusCode: 403
    },
    ValidationUsername: {
        code: 1006,
        message: 'Invalid username',
        statusCode: 403
    },
    ValidationPassword: {
        code: 1007,
        message: 'Invalid password',
        statusCode: 403
    },
    ValidationSuperadmin: {
        code: 10008,
        message: 'You do not have enough permissions',
        statusCode: 403
    },
    ValidationRegistration: {
        code: 1500,
        message: 'something was wrong',
        statusCode: 403
    },
    ValidationLogin: {
        code: 1501,
        message: 'Invalid login',
        statusCode: 403
    },
    ValidationChangePassword: {
        code: 1502,
        message: 'Invalid change password',
        statusCode: 403
    },
    DatabaseError: {
        code: 2001,
        message: 'something was wrong',
        statusCode: 500
    }
})

module.exports = exceptionPool
