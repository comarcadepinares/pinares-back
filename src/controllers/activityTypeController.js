'use strict'

const activityTypeManager = require('../managers/activityTypeManager')
const pagination = require('../services/pagination')

module.exports = {
    async getAll (req, res, next) {
        res.locals.response = await activityTypeManager.getAll(pagination(req.query))
        next()
    },

    async create (req, res, next) {
        try {
            res.locals.response = await activityTypeManager.create(req.body, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async update (req, res, next) {
        try {
            res.locals.response = await activityTypeManager.update(res.locals.activityType, req.body, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async getOne (req, res, next) {
        res.locals.response = activityTypeManager.getOne(res.locals.activityType)
        next()
    },

    async remove (req, res, next) {
        res.locals.response = await activityTypeManager.remove(res.locals.activityType)
        next()
    }
}
