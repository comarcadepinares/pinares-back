'use strict'

const townManager = require('../managers/townManager')
const pagination = require('../services/pagination')

module.exports = {
    async getAll (req, res, next) {
        res.locals.response = await townManager.getAll(pagination(req.query))
        next()
    },

    async create (req, res, next) {
        try {
            res.locals.response = await townManager.create(res.locals.user, req.body, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async update (req, res, next) {
        try {
            res.locals.response = await townManager.update(res.locals.town, req.body, req.file)
            next()
        } catch (error) {
            next(error)
        }
    },

    async getOne (req, res, next) {
        res.locals.response = townManager.getOne(res.locals.town)
        next()
    },

    async remove (req, res, next) {
        res.locals.response = await townManager.remove(res.locals.town)
        next()
    }
}
