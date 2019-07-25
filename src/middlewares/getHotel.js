'use strict'

const Hotel = require('../appManager').models.Hotel
const exception = require('../services/customExceptions')

module.exports = function getContent () {
    return async function (req, res, next) {
        const hotel = await Hotel.getOneBySlug(req.params.slug)

        if (!hotel) {
            return next(new exception.EntityNotExists())
        }

        res.locals.hotel = hotel
        next()
    }
}
