'use strict'

const helmet = require('helmet')
const bodyParser = require('body-parser')
const cors = require('cors')
const customExceptions = requireRoot('services/customExceptions')
const appManager = requireRoot('./appManager')

module.exports = function (app) {
    // Disable express header
    app.set('x-powered-by', false)
    app.set('etag', false)

    // cors
    app.use(cors())

    // Helmet security enabled
    app.use(helmet())

    // Throw error if no db connection
    app.use(function (req, res, next) {
        if (!appManager.running) { throw new customExceptions.DatabaseError() }
        next()
    })

    // Parses http body
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
}
