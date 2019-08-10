'use strict'

const Promise = require('bluebird')

const Hotel = require('../appManager').models.Hotel
const processMediaUpload = require('../services/processMediaUpload')
const { slugify } = require('../services/utils')
const { addSRID } = require('../services/geom')
const exception = require('../services/customExceptions')
const parameters = requireRoot('../parameters')
const debug = require('debug')('app:managers:hotel')

module.exports = {
    async getAll (pagination, filter) {
        const hotels = await Hotel.getAll(pagination, filter)
        const hotelsInfo = await Promise.all(
            Promise.map(hotels, async function (hotel) {
                return hotel.getPublicInfo()
            })
        )

        return {
            hotels: hotelsInfo,
            pagination: {
                page: pagination.page,
                limit: pagination.limit
            }
        }
    },

    async create (user, { name, type, townId, description, location, address, phone, email, web, highlight }, image) {
        if (!name || !description || !location || !Hotel.TYPES.includes(type) || !townId) {
            throw new exception.ValidationHotel()
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

        let hotel = new Hotel({
            name,
            slug: slugify(name),
            highlight,
            type,
            description,
            image,
            images: [],
            location,
            address,
            phone,
            email,
            web,
            userId: user.id,
            townId
        })

        try {
            hotel = await hotel.save()
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new exception.EntityAlreadyExists()
            }
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return hotel.getPublicInfo()
    },

    async update (hotel, { name, type, townId, description, location, address, phone, email, web, highlight }, image) {
        if (!name || !description || !location || !Hotel.TYPES.includes(type) || !townId) {
            throw new exception.ValidationHotel()
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

        if (image && hotel.image !== image) {
            image = await processMediaUpload.preprocessImages([image])

            try {
                // upload to S3
                image = await processMediaUpload.images(image, parameters.AWS.folder)
                image = image[0]
            } catch (error) {
                throw new exception.UploadingImagesError()
            }
        } else {
            image = hotel.image
        }

        hotel.name = name
        hotel.highlight = highlight
        hotel.type = type
        hotel.description = description
        hotel.image = image || null
        hotel.location = location
        hotel.address = address
        hotel.phone = phone
        hotel.email = email
        hotel.web = web
        hotel.townId = townId

        try {
            hotel = await hotel.save()
        } catch (error) {
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return hotel.getPublicInfo()
    },

    getOne (hotel) {
        return hotel.getPublicInfo()
    },

    async remove (hotel) {
        hotel.removed = true
        hotel.save()

        return true
    },

    async addImage (hotel, image) {
        try {
            image = await processMediaUpload.preprocessImages([image])
            // upload to S3
            image = await processMediaUpload.images(image, parameters.AWS.folder)
            image = image[0]
        } catch (error) {
            throw new exception.UploadingImagesError()
        }

        hotel.images.push(image)
        hotel.images = hotel.images
        await hotel.save()

        return hotel.getPublicInfo()
    },

    async removeImage (hotel, { image }) {
        if (image) {
            hotel.images = hotel.images.filter(i => i !== image)
            await hotel.save()
        }

        return hotel.getPublicInfo()
    },

    getTypes () {
        return { types: Hotel.TYPES }
    }
}
