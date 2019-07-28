'use strict'

const Promise = require('bluebird')

const ActivityType = require('../appManager').models.ActivityType
const processMediaUpload = require('../services/processMediaUpload')
const { slugify } = require('../services/utils')
const exception = require('../services/customExceptions')
const parameters = requireRoot('../parameters')
const debug = require('debug')('app:managers:activityType')

module.exports = {
    async getAll (pagination) {
        const activityTypes = await ActivityType.getAll(pagination)
        const activityTypesInfo = await Promise.all(
            Promise.map(activityTypes, async function (activityType) {
                return activityType.getPublicInfo()
            })
        )

        return {
            activityTypes: activityTypesInfo,
            pagination: {
                page: pagination.page,
                limit: pagination.limit
            }
        }
    },

    async create ({ name, description }, image) {
        if (!name || !description ) {
            throw new exception.ValidationActivityType()
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

        let activityType = new ActivityType({
            name,
            slug: slugify(name),
            description,
            image
        })

        try {
            activityType = await activityType.save()
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new exception.EntityAlreadyExists()
            }
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return activityType.getPublicInfo()
    },

    async update (activityType, { name, description }, image) {
        if (!name || !description) {
            throw new exception.ValidationActivityType()
        }

        if (image && activityType.image !== image) {
            image = await processMediaUpload.preprocessImages([image])

            try {
                // upload to S3
                image = await processMediaUpload.images(image, parameters.AWS.folder)
                image = image[0]
            } catch (error) {
                throw new exception.UploadingImagesError()
            }
        } else {
            image = activityType.image
        }

        activityType.name = name
        activityType.description = description
        activityType.image = image || null

        try {
            activityType = await activityType.save()
        } catch (error) {
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return activityType.getPublicInfo()
    },

    getOne (activityType) {
        return activityType.getPublicInfo()
    },

    async remove (activityType) {
        activityType.removed = true
        activityType.save()

        return true
    }
}
