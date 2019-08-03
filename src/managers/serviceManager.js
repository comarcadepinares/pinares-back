'use strict'

const Promise = require('bluebird')

const Service = require('../appManager').models.Service
const processMediaUpload = require('../services/processMediaUpload')
const { slugify } = require('../services/utils')
const { addSRID } = require('../services/geom')
const exception = require('../services/customExceptions')
const parameters = requireRoot('../parameters')
const debug = require('debug')('app:managers:service')

module.exports = {
    async getAll (pagination) {
        const services = await Service.getAll(pagination)
        const servicesInfo = await Promise.all(
            Promise.map(services, async function (service) {
                return service.getPublicInfo()
            })
        )

        return {
            services: servicesInfo,
            pagination: {
                page: pagination.page,
                limit: pagination.limit
            }
        }
    },

    async create (user, { name, type, townId, description, location, address, phone, email, web }, image) {
        if (!name || !description || !location || !Service.TYPES.includes(type) || !townId) {
            throw new exception.ValidationService()
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

        let service = new Service({
            name,
            slug: slugify(name),
            type,
            description,
            image,
            location,
            address,
            phone,
            email,
            web,
            userId: user.id,
            townId
        })

        try {
            service = await service.save()
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new exception.EntityAlreadyExists()
            }
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return service.getPublicInfo()
    },

    async update (service, { name, type, townId, description, location, address, phone, email, web }, image) {
        if (!name || !description || !location || !Service.TYPES.includes(type) || !townId) {
            throw new exception.ValidationService()
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

        if (image && service.image !== image) {
            image = await processMediaUpload.preprocessImages([image])

            try {
                // upload to S3
                image = await processMediaUpload.images(image, parameters.AWS.folder)
                image = image[0]
            } catch (error) {
                throw new exception.UploadingImagesError()
            }
        } else {
            image = service.image
        }

        service.name = name
        service.type = type
        service.description = description
        service.image = image || null
        service.location = location
        service.address = address
        service.phone = phone
        service.email = email
        service.web = web
        service.townId = townId

        try {
            service = await service.save()
        } catch (error) {
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return service.getPublicInfo()
    },

    getOne (service) {
        return service.getPublicInfo()
    },

    async remove (service) {
        service.removed = true
        service.save()

        return true
    },

    getTypes () {
        return { types: Service.TYPES }
    },
}