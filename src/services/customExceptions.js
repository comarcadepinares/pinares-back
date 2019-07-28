'use strict'

const errors = [
    {
        name: 'SomethingWasWrong',
        code: 666,
        message: 'Something was wrong',
        statusCode: 500
    },
    {
        name: 'NotFoundError',
        code: 404,
        message: 'Route not found',
        statusCode: 404
    },
    {
        name: 'ValidationPublicKeyFailed',
        code: 1001,
        message: 'Authentication failed',
        statusCode: 403
    },
    {
        name: 'ValidationTokenExpired',
        code: 1002,
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
        name: 'ValidationSuperadmin',
        code: 1008,
        message: 'You do not have enough permissions',
        statusCode: 403
    },
    {
        name: 'ValidationRegistration',
        code: 1100,
        message: 'something was wrong',
        statusCode: 403
    },
    {
        name: 'ValidationLogin',
        code: 1101,
        message: 'Invalid login',
        statusCode: 403
    },
    {
        name: 'ValidationChangePassword',
        code: 1102,
        message: 'Invalid change password',
        statusCode: 403
    },
    {
        name: 'ValueError',
        code: 1200,
        message: 'Wrong value',
        statusCode: 400
    },
    {
        name: 'UploadingImagesError',
        code: 1201,
        message: 'Error uploading images',
        statusCode: 400
    },
    {
        name: 'EntityNotExists',
        code: 1202,
        message: 'Entity does not exists',
        statusCode: 404
    },
    {
        name: 'EntityAlreadyExists',
        code: 1203,
        message: 'Entity already exists',
        statusCode: 400
    },
    {
        name: 'ValidationTown',
        code: 1400,
        message: 'Name, description and location are required',
        statusCode: 400
    },
    {
        name: 'ValidationActivityType',
        code: 1401,
        message: 'Name and description are required',
        statusCode: 400
    },
    {
        name: 'ValidationHotel',
        code: 1402,
        message: 'Name, type, townId, description and location are required',
        statusCode: 400
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
