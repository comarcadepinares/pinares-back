'use strict'

const ActivityOption = require('../appManager').models.ActivityOption
const exception = require('../services/customExceptions')

module.exports = function getContent (validateUser = false) {
    return async function (req, res, next) {
        const activityOption = await ActivityOption.getOneById(parseInt(req.params.id))

        if (!activityOption) {
            return next(new exception.EntityNotExists())
        }

        if (validateUser && (!res.locals.user || (!res.locals.user.isSuperAdmin() && activityOption.userId !== res.locals.user.id))) {
            return next(new exception.EntityNotExists())
        }

        res.locals.activityOption = activityOption
        next()
    }
}
