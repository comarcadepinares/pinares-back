'use strict'

const Promise = require('bluebird')
const Town = require('../appManager').models.Town
const { slugify } = require('../services/utils')
const exception = require('../services/customExceptions')

module.exports = {
    async getAll (pagination) {
        const towns = await Town.getAll(pagination)
        const townsInfo = await Promise.all(
            Promise.map(towns, async function (town) {
                return town.getPublicInfo()
            })
        )

        return {
            towns: townsInfo,
            pagination: {
                page: pagination.page,
                limit: pagination.limit
            }
        }
    },

    async create ({ name, description, image, location, address, phone, email, web }) {
        let town = new Town({
            name,
            slug: slugify(name),
            description,
            image,
            location,
            address,
            phone,
            email,
            web
        })

        try {
            town = await town.save()
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                throw new exception.ValidationContentName()
            }
            throw new exception.SomethingWasWrong()
        }

        return town.getPublicInfo()
    },

    async getOne (town) {
        return town.getPublicInfo()
    },

    async remove (town) {
        town.removed = true
        town.save()

        return true
    }
}
