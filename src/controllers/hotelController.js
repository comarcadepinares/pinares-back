'use strict'

const hotelManager = require('../managers/hotelManager')
const pagination = require('../services/pagination')

module.exports = {
    async getAll (req, res, next) {
        res.locals.response = await hotelManager.getAll(pagination(req.query))
        next()
    },

    async create (req, res, next) {
        try {
            res.locals.response = await hotelManager.create(res.locals.user, req.body, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async update (req, res, next) {
        try {
            res.locals.response = await hotelManager.update(res.locals.hotel, req.body, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async getOne (req, res, next) {
        res.locals.response = hotelManager.getOne(res.locals.hotel)
        next()
    },

    async remove (req, res, next) {
        res.locals.response = await hotelManager.remove(res.locals.hotel)
        next()
    },

    getTypes (req, res, next) {
        res.locals.response = hotelManager.getTypes()
        next()
    },
}
