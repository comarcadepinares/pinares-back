'use strict'

const Promise = require('bluebird')

const Activity = require('../appManager').models.Activity
const ActivityOption = require('../appManager').models.ActivityOption

const processMediaUpload = require('../services/processMediaUpload')
const { slugify } = require('../services/utils')
const { addSRID } = require('../services/geom')
const exception = require('../services/customExceptions')
const parameters = requireRoot('../parameters')
const debug = require('debug')('app:managers:activity')

module.exports = {
    async getAll (pagination, filter) {
        const activities = await Activity.getAll(pagination, filter)
        const activitiesInfo = await Promise.all(
            Promise.map(activities, async function (activity) {
                return await getActivityWithOptions(activity)
            })
        )

        return {
            activities: activitiesInfo,
            pagination: {
                page: pagination.page,
                limit: pagination.limit
            }
        }
    },

    async create (user, { name, townId, activityTypeId, description, location, address, phone, email, web, highlight }, image) {
        if (!name || !description || !location || !townId || !activityTypeId) {
            throw new exception.ValidationActivity()
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

        let activity = new Activity({
            name,
            slug: slugify(name),
            highlight,
            description,
            image,
            images: [],
            location,
            address,
            phone,
            email,
            web,
            userId: user.id,
            townId,
            activityTypeId
        })

        try {
            activity = await activity.save()
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new exception.EntityAlreadyExists()
            }
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return await getActivityWithOptions(activity)
    },

    async update (activity, { name, townId, activityTypeId, description, location, address, phone, email, web, highlight }, image) {
        if (!name || !description || !location || !townId || !activityTypeId) {
            throw new exception.ValidationActivity()
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

        if (image && activity.image !== image) {
            image = await processMediaUpload.preprocessImages([image])

            try {
                // upload to S3
                image = await processMediaUpload.images(image, parameters.AWS.folder)
                image = image[0]
            } catch (error) {
                throw new exception.UploadingImagesError()
            }
        } else {
            image = activity.image
        }

        activity.name = name
        activity.highlight = highlight
        activity.description = description
        activity.image = image || null
        activity.location = location
        activity.address = address
        activity.phone = phone
        activity.email = email
        activity.web = web
        activity.townId = townId
        activity.activityTypeId = activityTypeId

        try {
            activity = await activity.save()
        } catch (error) {
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return await getActivityWithOptions(activity)
    },

    async getOne (activity) {
        return await getActivityWithOptions(activity)
    },

    async remove (activity) {
        activity.removed = true
        activity.save()

        return true
    },

    async addImage (activity, image) {
        try {
            image = await processMediaUpload.preprocessImages([image])
            // upload to S3
            image = await processMediaUpload.images(image, parameters.AWS.folder)
            image = image[0]
        } catch (error) {
            throw new exception.UploadingImagesError()
        }

        activity.images.push(image)
        activity.images = activity.images
        await activity.save()

        return await getActivityWithOptions(activity)
    },

    async removeImage (activity, { image }) {
        if (image) {
            activity.images = activity.images.filter(i => i !== image)
            await activity.save()
        }

        return await getActivityWithOptions(activity)
    }
}

async function getActivityWithOptions (activity) {
    const activityOptions = await ActivityOption.getAllByActivityId(activity.id)
    return Object.assign(
        activity.getPublicInfo(),
        { options: activityOptions }
    )
}
