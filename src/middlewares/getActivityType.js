'use strict'

const ActivityType = require('../appManager').models.ActivityType
const exception = require('../services/customExceptions')

module.exports = function getContent () {
    return async function (req, res, next) {
        const activityType = await ActivityType.getOneBySlug(req.params.slug)

        if (!activityType) {
            return next(new exception.EntityNotExists())
        }

        res.locals.activityType = activityType
        next()
    }
}
