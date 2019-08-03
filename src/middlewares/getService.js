'use strict'

const Service = require('../appManager').models.Service
const exception = require('../services/customExceptions')

module.exports = function getContent (validateUser = false) {
    return async function (req, res, next) {
        const service = await Service.getOneBySlug(req.params.slug)

        if (!service) {
            return next(new exception.EntityNotExists())
        }

        if (validateUser && (!res.locals.user || (!res.locals.user.isSuperAdmin() && service.userId !== res.locals.user.id))) {
            return next(new exception.EntityNotExists())
        }

        res.locals.service = service
        next()
    }
}
