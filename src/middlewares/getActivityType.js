'use strict'

const ActivityType = require('../appManager').models.ActivityType
const exception = require('../services/customExceptions')

module.exports = function getContent (validateUser = false) {
    return async function (req, res, next) {
        const activityType = await ActivityType.getOneBySlug(req.params.slug)

        if (!activityType) {
            return next(new exception.EntityNotExists())
        }

        if (validateUser && (!res.locals.user || (!res.locals.user.isSuperAdmin() && activityType.userId !== res.locals.user.id))) {
            return next(new exception.EntityNotExists())
        }

        res.locals.activityType = activityType
        next()
    }
}
