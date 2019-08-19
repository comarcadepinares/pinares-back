'use strict'

const Promise = require('bluebird')

const ActivityOption = require('../appManager').models.ActivityOption
const ActivityPoint = require('../appManager').models.ActivityPoint
const ActivityLine = require('../appManager').models.ActivityLine

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

    async create (user, activity, { schedule, price, priceType, location, duration, description, recomendations, people, minPax, maxPax }) {
        if (!price || !priceType) {
            throw new exception.ValidationActivityOption()
        }

        if (typeof schedule === 'string') {
            try {
                schedule = JSON.parse(schedule)
            } catch (error) {
                throw new exception.ValueError('Wrong schedule parameter')
            }
        }

        if (people && typeof people === 'string') {
            try {
                people = JSON.parse(people)
            } catch (error) {
                throw new exception.ValueError('Wrong people parameter')
            }
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

        let activityOption = new ActivityOption({
            schedule,
            price,
            priceType,
            location,
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

    async update (activityOption, { schedule, price, priceType, location, duration, description, recomendations, people, minPax, maxPax }) {
        if (!price || !priceType) {
            throw new exception.ValidationActivityOption()
        }

        if (typeof schedule === 'string') {
            try {
                schedule = JSON.parse(schedule)
            } catch (error) {
                throw new exception.ValueError('Wrong schedule parameter')
            }
        }

        if (people && typeof people === 'string') {
            try {
                people = JSON.parse(people)
            } catch (error) {
                throw new exception.ValueError('Wrong people parameter')
            }
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

        activityOption.schedule = schedule
        activityOption.price = price
        activityOption.priceType = priceType
        activityOption.location = location
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
    },

    async addLine (user, activityOption, activity, {line, name}) {
        if (typeof line === 'string') {
            try {
                line = JSON.parse(line)
            } catch (error) {
                throw new exception.ValueError('Wrong line parameter')
            }
        }

        let activityLine = new ActivityLine({
            name,
            line: line,
            userId: user.id,
            townId: activity.townId,
            activityId: activity.id,
            ActivityOptionId: activityOption.id
        })

        try {
            activityLine = await activityLine.save()
        } catch (error) {
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return activityLine.getPublicInfo()
    },

    async removeLine (activityLine) {
        activityLine.removed = true
        activityLine.save()

        return true
    },

    async addPoint (user, activityOption, activity, {point, name}) {
        if (typeof point === 'string') {
            try {
                point = JSON.parse(point)
            } catch (error) {
                throw new exception.ValueError('Wrong point parameter')
            }
        }

        let activityPoint = new ActivityPoint({
            name,
            point: point,
            userId: user.id,
            townId: activity.townId,
            activityId: activity.id,
            ActivityOptionId: activityOption.id
        })

        try {
            activityPoint = await activityPoint.save()
        } catch (error) {
            debug(error)
            throw new exception.SomethingWasWrong()
        }

        return activityPoint.getPublicInfo()
    },

    async removePoint (activityPoint) {
        activityPoint.removed = true
        activityPoint.save()

        return true
    },
}

