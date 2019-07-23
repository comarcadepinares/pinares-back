'use strict'

const Town = require('../appManager').models.Town
const exception = require('../services/customExceptions')

module.exports = function getContent () {
    return async function (req, res, next) {
        const town = await Town.getOneBySlug(req.params.slug)

        if (!town) {
            return next(new exception.EntityNotExists())
        }

        res.locals.town = town
        next()
    }
}
