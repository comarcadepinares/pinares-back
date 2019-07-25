'use strict'

const hotelManager = require('../managers/hotelManager')
const pagination = require('../services/pagination')
const debug = require('debug')('app:controllers:hotel')

module.exports = {
    async getAll (req, res, next) {
        res.locals.response = await hotelManager.getAll(pagination(req.query))
        next()
    },

    async create (req, res, next) {
        try {
            res.locals.response = await hotelManager.create(req.body, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async update (req, res, next) {
        res.locals.response = await hotelManager.update(res.locals.hotel, req.body, req.file)
        next()
    },

    async getOne (req, res, next) {
        res.locals.response = hotelManager.getOne(res.locals.hotel)
        next()
    },

    async remove (req, res, next) {
        res.locals.response = await hotelManager.remove(res.locals.hotel)
        next()
    }
}
