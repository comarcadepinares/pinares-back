'use strict'
const debug = require('debug')('app:handlers')

module.exports = {

    async index (req, res, next) {
        res.locals.response = 'hi'
        next()
    },

    async logged (req, res, next) {
        res.locals.response = 'You are logged'
        next()
    }
}
