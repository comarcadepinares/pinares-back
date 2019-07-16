'use strict'

const townManager = require('../managers/townManager')
const pagination = require('../services/pagination')

module.exports = {
    async getAll (req, res) {
        return townManager.getAll(pagination(req.query))
    },

    async create (req, res) {
        return townManager.create(req.body)
    },

    async getOne (req, res) {
        return townManager.getOne(res.locals.content)
    },

    async remove (req, res) {
        return townManager.remove(res.locals.content)
    }
}
