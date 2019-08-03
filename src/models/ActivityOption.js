'use strict'

const base = require('./_Base')
const schedule = require('./_schedule')

const PEOPLE_TYPES = {
    CHILDREN: 'children',
    YOUNG: 'young',
    ADULT: 'adult',
    OLD: 'old'
}

const CURRENCY_EUR = 'EUR'
const CURRENCIES = [CURRENCY_EUR]

module.exports = (sequelize, DataTypes) => {
    let ActivityOption = sequelize.define('activity_option', Object.assign({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        priceType: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1, // number of people included in price. 0 is for all
        },
        currency: {
            type: DataTypes.ENUM,
            values: CURRENCIES,
            default: CURRENCY_EUR
        },
        location: {
            type: DataTypes.GEOMETRY('POINT', 4326),
            allowNull: true
        },
        journey: {
            type: DataTypes.GEOMETRY('LINESTRING', 4326),
            allowNull: true
        },
        duration: { //in minutes
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        recomendations: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        people: { // PEOPLE_TYPES - empty for all publics
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true
        },
        minPax: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        maxPax: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    }, schedule, base), {
        timestamps: true,
        defaultScope: {
            where: {
                removed: false,
                actived: true
            }
        },
        indexes: [
            {
                fields: ['activityId'],
                using: 'BTREE'
            }
        ]
    })

    ActivityOption.associate = function (models) {
        ActivityOption.belongsTo(models.User)
        ActivityOption.belongsTo(models.Town)
        ActivityOption.belongsTo(models.Activity)
    }

    ActivityOption.getAll = function ({ offset, limit }) {
        return this.findAll({ offset, limit })
    }

    ActivityOption.getAllByActivityId = function (activityId, { offset, limit } = { offset: 0, limit: 1000}) {
        return this.findAll({ where: { activityId }, offset, limit })
    }

    ActivityOption.getOneById = function (id) {
        return this.findOne({ where: { id } })
    }

    ActivityOption.PEOPLE_TYPES = PEOPLE_TYPES

    Object.assign(ActivityOption.prototype, {
        getPublicInfo () {
            const location = this.location
            delete location.crs
            const journey = this.journey
            delete journey.crs

            let publicInfo = {
                id: this.id,
                schedule: this.schedule,
                price: this.price,
                priceType: this.priceType,
                location,
                journey,
                duration: this.duration,
                description: this.description,
                recomendations: this.recomendations,
                people: this.people,
                minPax: this.minPax,
                maxPax: this.maxPax
            }

            return publicInfo
        }
    })


    return ActivityOption
}
