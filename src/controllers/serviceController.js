'use strict'

const serviceManager = require('../managers/serviceManager')
const pagination = require('../services/pagination')

module.exports = {
    async getAll (req, res, next) {
        res.locals.response = await serviceManager.getAll(pagination(req.query))
        next()
    },

    async create (req, res, next) {
        try {
            res.locals.response = await serviceManager.create(res.locals.user, req.body, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async update (req, res, next) {
        try {
            res.locals.response = await serviceManager.update(res.locals.service, req.body, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async getOne (req, res, next) {
        res.locals.response = serviceManager.getOne(res.locals.service)
        next()
    },

    async remove (req, res, next) {
        res.locals.response = await serviceManager.remove(res.locals.service)
        next()
    },

    async addImage (req, res, next) {
        try {
            res.locals.response = await serviceManager.addImage(res.locals.service, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async removeImage (req, res, next) {
        try {
            res.locals.response = await serviceManager.removeImage(res.locals.service, req.body)
            next()
        } catch (error) {
            next(error)
        }
    },

    getTypes (req, res, next) {
        res.locals.response = serviceManager.getTypes()
        next()
    },
}
