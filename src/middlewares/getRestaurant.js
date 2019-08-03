'use strict'

const Restaurant = require('../appManager').models.Restaurant
const exception = require('../services/customExceptions')

module.exports = function getContent (validateUser = false) {
    return async function (req, res, next) {
        const restaurant = await Restaurant.getOneBySlug(req.params.slug)

        if (!restaurant) {
            return next(new exception.EntityNotExists())
        }

        if (validateUser && (!res.locals.user || (!res.locals.user.isSuperAdmin() && restaurant.userId !== res.locals.user.id))) {
            return next(new exception.EntityNotExists())
        }

        res.locals.restaurant = restaurant
        next()
    }
}
