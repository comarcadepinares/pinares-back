'use strict'

const Promise = require('bluebird')

const ActivityOption = require('../appManager').models.ActivityOption
const { addSRID } = require('../services/geom')
const exception = require('../services/customExceptions')
const debug = require('debug')('app:managers:activityOption')

module.exports = {
    async getAll (pagination) {
        const activityOptions = await ActivityOption.getAll(pagination)
        const activityOptionsInfo = await Promise.all(
            Promise.map(activityOptions, async function (activityOption) {
                return activityOption.getPublicInfo()
            })
        )

        return {
            activityOptions: activityOptionsInfo,
            pagination: {
                page: pagination.page,
                limit: pagination.limit
            }
        }
    },

    async create (user, activity, { schedule, price, priceType, location, journey, duration, description, recomendations, people, minPax, maxPax }) {
        if (!price || !priceType) {
            throw new exception.ValidationActivityOption()
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

        if (journey) {
            if (typeof journey === 'string') {
                try {
                    journey = JSON.parse(journey)
                } catch (error) {
                    throw new exception.ValueError('Wrong journey parameter')
                }
            }

            journey = addSRID(journey)
        }

        let activityOption = new ActivityOption({
            schedule,
            price,
            priceType,
            location,
            journey,
            duration,
            description,
            recomendations,
            people,
            minPax,
            maxPax,
            activityId: activity.id,
            userId: user.id,
            townId: activity.townId
        })

        try {
            activityOption = await activityOption.save()
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new exception.EntityAlreadyExists()
            }
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return activityOption.getPublicInfo()
    },

    async update (activityOption, { schedule, price, priceType, location, journey, duration, description, recomendations, people, minPax, maxPax }) {
        if (!price || !priceType) {
            throw new exception.ValidationActivityOption()
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

        if (journey) {
            if (typeof journey === 'string') {
                try {
                    journey = JSON.parse(journey)
                } catch (error) {
                    throw new exception.ValueError('Wrong journey parameter')
                }
            }

            journey = addSRID(journey)
        }

        activityOption.schedule = schedule
        activityOption.price = price
        activityOption.priceType = priceType
        activityOption.location = location
        activityOption.journey = journey
        activityOption.duration = duration
        activityOption.description = description
        activityOption.recomendations = recomendations
        activityOption.people = people
        activityOption.minPax = minPax
        activityOption.maxPax = maxPax

        try {
            activityOption = await activityOption.save()
        } catch (error) {
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return activityOption.getPublicInfo()
    },

    getOne (activityOption) {
        return activityOption.getPublicInfo()
    },

    async remove (activityOption) {
        activityOption.removed = true
        activityOption.save()

        return true
    }
}
