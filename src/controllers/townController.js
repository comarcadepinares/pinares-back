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
            res.locals.response = await townManager.create(req.body)
            next()
        } catch (error) {
            next(error)
        }
    },

    async getOne (req, res) {
        return townManager.getOne(res.locals.content)
    },

    async remove (req, res) {
        return townManager.remove(res.locals.content)
    }
}
