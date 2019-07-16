'use strict'

const errors = [
    {
        name: 'NotFoundError',
        code: 404,
        message: 'Route not found',
        statusCode: 404
    },
    {
        name: 'ValidationFailed',
        code: 1001,
        message: 'Authentication failed',
        statusCode: 403
    },
    {
        name: 'ValidationPublicKeyFailed',
        code: 1002,
        message: 'Authentication failed',
        statusCode: 403
    },
    {
        name: 'ValidationTokenExpired',
        code: 1004,
        message: 'Token expired',
        statusCode: 403
    },
    {
        name: 'ValidationEmail',
        code: 1005,
        message: 'Invalid email',
        statusCode: 403
    },
    {
        name: 'ValidationUsername',
        code: 1006,
        message: 'Invalid username',
        statusCode: 403
    },
    {
        name: 'ValidationPassword',
        code: 1007,
        message: 'Invalid password',
        statusCode: 403
    },
    {
        name: 'ValidationRegistration',
        code: 1500,
        message: 'something was wrong',
        statusCode: 403
    },
    {
        name: 'ValidationLogin',
        code: 1501,
        message: 'Invalid login',
        statusCode: 403
    },
    {
        name: 'ValidationChangePassword',
        code: 1502,
        message: 'Invalid change password',
        statusCode: 403
    },
    {
        name: 'DatabaseError',
        code: 2001,
        message: 'something was wrong',
        statusCode: 500
    }
]

class CustomExceptionBase extends Error {}

function getCustomException (defaults) {
    return class CustomException extends CustomExceptionBase {
        constructor ({ message = null, statusCode = null, name = null, code = null, error = null } = {}) {
            super(message || defaults.message)

            this.statusCode = statusCode || defaults.statusCode
            this.name = name || defaults.name
            this.code = code || defaults.code
            this.error = error
        }
    }
}

const customExceptions = {}
errors.forEach(error => {
    customExceptions[error.name] = getCustomException(error)
})

module.exports = customExceptions
module.exports.CustomException = CustomExceptionBase
