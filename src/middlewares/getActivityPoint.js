'use strict'

const ActivityPoint = require('../appManager').models.ActivityPoint
const exception = require('../services/customExceptions')

module.exports = function getActivityPoint (validateUser = false) {
    return async function (req, res, next) {
        const activityPoint = await ActivityPoint.getOneById(parseInt(req.params.lineId))

        if (!activityPoint || activityPoint.activityId !== res.locals.activity.id) {
            return next(new exception.EntityNotExists())
        }

        if (validateUser && (!res.locals.user || (!res.locals.user.isSuperAdmin() && activityPoint.userId !== res.locals.user.id))) {
            return next(new exception.EntityNotExists())
        }

        res.locals.activityPoint = activityPoint
        next()
    }
}
