'use strict'

const activityManager = require('../managers/activityManager')
const pagination = require('../services/pagination')

module.exports = {
    async getAll (req, res, next) {
        res.locals.response = await activityManager.getAll(pagination(req.query))
        next()
    },

    async create (req, res, next) {
        try {
            res.locals.response = await activityManager.create(res.locals.user, req.body, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async update (req, res, next) {
        try {
            res.locals.response = await activityManager.update(res.locals.activity, req.body, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async getOne (req, res, next) {
        res.locals.response = await activityManager.getOne(res.locals.activity)
        next()
    },

    async remove (req, res, next) {
        res.locals.response = await activityManager.remove(res.locals.activity)
        next()
    },

    async addImage (req, res, next) {
        try {
            res.locals.response = await activityManager.addImage(res.locals.activity, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async removeImage (req, res, next) {
        try {
            res.locals.response = await activityManager.removeImage(res.locals.activity, req.body)
            next()
        } catch (error) {
            next(error)
        }
    }
}
