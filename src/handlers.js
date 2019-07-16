'use strict'

const exception = requireRoot('services/customExceptions')

module.exports = function (app) {
    // 404
    app.use(function(req, res, next){
        if (!res.locals.response) {
            next(new exception.NotFoundError())
        }

        next()
    })

    app.use(function (req, res, next) {
        const response = {
            status: true,
            data: res.locals.response
        }

        res.json(response)
    })

    // 50x
    app.use(function expressDeliverErrorResponse(err, req, res, next) {
        if (!(err instanceof exception.CustomException)) {
            err = new exception.CustomException(err)
            err.code = 500
        }

        const response = {
            status: false,
            error: {
                code: err.code,
                message: err.message
            }
        }

        if (err.error) {
            response.error.data = {
                error: err.error
            }
        }

        res.status(err.statusCode).json(response)
    })
}
