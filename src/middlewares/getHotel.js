'use strict'

const Hotel = require('../appManager').models.Hotel
const exception = require('../services/customExceptions')

module.exports = function getContent (validateUser = false) {
    return async function (req, res, next) {
        const hotel = await Hotel.getOneBySlug(req.params.slug)

        if (!hotel) {
            return next(new exception.EntityNotExists())
        }

        if (validateUser && (!res.locals.user || (!res.locals.user.isSuperAdmin() && hotel.userId !== res.locals.user.id))) {
            return next(new exception.EntityNotExists())
        }

        res.locals.hotel = hotel
        next()
    }
}
