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

        if (typeof location === 'string') {
            try {
                location = JSON.parse(location)
            } catch (error) {
                throw new exception.ValueError('Wrong location parameter')
            }
        }

        if (image) {
            image = await processMediaUpload.preprocessImages([image])

            try {
                // upload to S3
                image = await processMediaUpload.images(image, parameters.AWS.folder)
                image = image[0]
            } catch (err) {
                debug('ERROR', err)
                throw new exception.UploadingImagesError()
            }
        }

        let town = new Town({
            name,
            slug: slugify(name),
            description,
            image,
            location: addSRID(location),
            address,
            phone,
            email,
            web
        })

        town = await town.save()

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
