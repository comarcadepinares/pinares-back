'use strict'

const activityOptionManager = require('../managers/activityOptionManager')
const pagination = require('../services/pagination')

module.exports = {
    async getAll (req, res, next) {
        res.locals.response = await activityOptionManager.getAll(pagination(req.query))
        next()
    },

    async create (req, res, next) {
        try {
            res.locals.response = await activityOptionManager.create(res.locals.user, res.locals.activity, req.body)
            next()
        } catch (error) {
            next(error)
        }
    },

    async update (req, res, next) {
        try {
            res.locals.response = await activityOptionManager.update(res.locals.activityOption, req.body)
            next()
        } catch (error) {
            next(error)
        }
    },

    async getOne (req, res, next) {
        res.locals.response = activityOptionManager.getOne(res.locals.activityOption)
        next()
    },

    async remove (req, res, next) {
        res.locals.response = await activityOptionManager.remove(res.locals.activityOption)
        next()
    }
}
