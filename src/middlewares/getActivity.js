'use strict'

const Activity = require('../appManager').models.Activity
const exception = require('../services/customExceptions')

module.exports = function getContent (validateUser = false) {
    return async function (req, res, next) {
        const activity = await Activity.getOneBySlug(req.params.slug)

        if (!activity) {
            return next(new exception.EntityNotExists())
        }

        if (validateUser && (!res.locals.user || (!res.locals.user.isSuperAdmin() && activity.userId !== res.locals.user.id))) {
            return next(new exception.EntityNotExists())
        }

        res.locals.activity = activity
        next()
    }
}
