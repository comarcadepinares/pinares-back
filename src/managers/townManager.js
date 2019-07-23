'use strict'

const Promise = require('bluebird')

const Town = require('../appManager').models.Town
const processMediaUpload = require('../services/processMediaUpload')
const { slugify } = require('../services/utils')
const { addSRID } = require('../services/geom')
const exception = require('../services/customExceptions')
const parameters = requireRoot('../parameters')
const debug = require('debug')('app:managers:town')

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

    async create ({ name, description, location, address, phone, email, web }, image) {
        if (!name || !description || !location) {
            throw new exception.ValidationTown()
        }

        if (location) {
            if (typeof location === 'string') {
                try {
                    location = JSON.parse(location)
                } catch (error) {
                    throw new exception.ValueError('Wrong location parameter')
                }

            }

            location = addSRID(location)
        }

        if (image) {
            image = await processMediaUpload.preprocessImages([image])

            try {
                // upload to S3
                image = await processMediaUpload.images(image, parameters.AWS.folder)
                image = image[0]
            } catch (error) {
                throw new exception.UploadingImagesError()
            }
        }

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
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new exception.EntityAlreadyExists()
            }
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return town.getPublicInfo()
    },

    async update (town, { description, location, address, phone, email, web }, image) {
        if (location) {
            if (typeof location === 'string') {
                try {
                    location = JSON.parse(location)
                } catch (error) {
                    throw new exception.ValueError('Wrong location parameter')
                }

            }

            location = addSRID(location)
        }

        if (image) {
            image = await processMediaUpload.preprocessImages([image])

            try {
                // upload to S3
                image = await processMediaUpload.images(image, parameters.AWS.folder)
                image = image[0]
            } catch (error) {
                throw new exception.UploadingImagesError()
            }
        }

        town.description = description
        town.image = image || null
        town.location = location
        town.address = address
        town.phone = phone
        town.email = email
        town.web = web

        try {
            town = await town.save()
        } catch (error) {
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return town.getPublicInfo()
    },

    getOne (town) {
        return town.getPublicInfo()
    },

    async remove (town) {
        town.removed = true
        town.save()

        return true
    }
}
