'use strict'

const expressDeliver = require('express-deliver')
const exception = requireRoot('services/customExceptions')

module.exports = function (app) {
    // 404
    app.use(function(){
        throw new exception.NotFoundError()
    })

    // 50x
    expressDeliver.errorHandler(app)
}
