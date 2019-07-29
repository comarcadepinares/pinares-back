'use strict'

const Town = require('../appManager').models.Town
const exception = require('../services/customExceptions')

module.exports = function getContent (validateUser = false) {
    return async function (req, res, next) {
        const town = await Town.getOneBySlug(req.params.slug)

        if (!town) {
            return next(new exception.EntityNotExists())
        }

        if (validateUser && (!res.locals.user || (!res.locals.user.isSuperAdmin() && town.userId !== res.locals.user.id))) {
            return next(new exception.EntityNotExists())
        }

        res.locals.town = town
        next()
    }
}
