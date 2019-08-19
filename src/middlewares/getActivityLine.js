'use strict'

const ActivityLine = require('../appManager').models.ActivityLine
const exception = require('../services/customExceptions')

module.exports = function getActivityLine (validateUser = false) {
    return async function (req, res, next) {
        const activityLine = await ActivityLine.getOneById(parseInt(req.params.lineId) || 0)

        if (!activityLine || activityLine.activityId !== res.locals.activity.id) {
            return next(new exception.EntityNotExists())
        }

        if (validateUser && (!res.locals.user || (!res.locals.user.isSuperAdmin() && activityLine.userId !== res.locals.user.id))) {
            return next(new exception.EntityNotExists())
        }

        res.locals.activityLine = activityLine
        next()
    }
}
