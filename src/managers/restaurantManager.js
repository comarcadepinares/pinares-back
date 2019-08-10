'use strict'

const Promise = require('bluebird')

const Restaurant = require('../appManager').models.Restaurant
const processMediaUpload = require('../services/processMediaUpload')
const { slugify } = require('../services/utils')
const { addSRID } = require('../services/geom')
const exception = require('../services/customExceptions')
const parameters = requireRoot('../parameters')
const debug = require('debug')('app:managers:restaurant')

module.exports = {
    async getAll (pagination) {
        const restaurants = await Restaurant.getAll(pagination)
        const restaurantsInfo = await Promise.all(
            Promise.map(restaurants, async function (restaurant) {
                return restaurant.getPublicInfo()
            })
        )

        return {
            restaurants: restaurantsInfo,
            pagination: {
                page: pagination.page,
                limit: pagination.limit
            }
        }
    },

    async create (user, { name, townId, description, location, address, phone, email, web }, image) {
        if (!name || !description || !location || !townId) {
            throw new exception.ValidationRestaurant()
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

        let restaurant = new Restaurant({
            name,
            slug: slugify(name),
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
            restaurant = await restaurant.save()
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new exception.EntityAlreadyExists()
            }
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return restaurant.getPublicInfo()
    },

    async update (restaurant, { name, townId, description, location, address, phone, email, web }, image) {
        if (!name || !description || !location || !townId) {
            throw new exception.ValidationRestaurant()
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

        if (image && restaurant.image !== image) {
            image = await processMediaUpload.preprocessImages([image])

            try {
                // upload to S3
                image = await processMediaUpload.images(image, parameters.AWS.folder)
                image = image[0]
            } catch (error) {
                throw new exception.UploadingImagesError()
            }
        } else {
            image = restaurant.image
        }

        restaurant.name = name
        restaurant.description = description
        restaurant.image = image || null
        restaurant.location = location
        restaurant.address = address
        restaurant.phone = phone
        restaurant.email = email
        restaurant.web = web
        restaurant.townId = townId

        try {
            restaurant = await restaurant.save()
        } catch (error) {
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return restaurant.getPublicInfo()
    },

    getOne (restaurant) {
        return restaurant.getPublicInfo()
    },

    async remove (restaurant) {
        restaurant.removed = true
        restaurant.save()

        return true
    },

    async addImage (restaurant, image) {
        try {
            image = await processMediaUpload.preprocessImages([image])
            // upload to S3
            image = await processMediaUpload.images(image, parameters.AWS.folder)
            image = image[0]
        } catch (error) {
            throw new exception.UploadingImagesError()
        }

        restaurant.images.push(image)
        restaurant.images = restaurant.images
        await restaurant.save()

        return restaurant.getPublicInfo()
    },

    async removeImage (restaurant, { image }) {
        if (image) {
            restaurant.images = restaurant.images.filter(i => i !== image)
            await restaurant.save()
        }

        return restaurant.getPublicInfo()
    }
}
