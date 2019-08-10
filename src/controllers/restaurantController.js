'use strict'

const restaurantManager = require('../managers/restaurantManager')
const pagination = require('../services/pagination')

module.exports = {
    async getAll (req, res, next) {
        res.locals.response = await restaurantManager.getAll(pagination(req.query))
        next()
    },

    async create (req, res, next) {
        try {
            res.locals.response = await restaurantManager.create(res.locals.user, req.body, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async update (req, res, next) {
        try {
            res.locals.response = await restaurantManager.update(res.locals.restaurant, req.body, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async getOne (req, res, next) {
        res.locals.response = restaurantManager.getOne(res.locals.restaurant)
        next()
    },

    async remove (req, res, next) {
        res.locals.response = await restaurantManager.remove(res.locals.restaurant)
        next()
    },

    async addImage (req, res, next) {
        try {
            res.locals.response = await restaurantManager.addImage(res.locals.restaurant, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async removeImage (req, res, next) {
        try {
            res.locals.response = await restaurantManager.removeImage(res.locals.restaurant, req.body)
            next()
        } catch (error) {
            next(error)
        }
    }
}
