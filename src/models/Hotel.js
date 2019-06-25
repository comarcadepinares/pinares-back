'use strict'

const baseExtended = require('./_BaseExtended')

const TYPE_HOTEL = 'hotel'
const TYPE_COTTAGE = 'cottage'
const TYPE_HOSTEL = 'hostel'
const TYPE_CAMPING = 'camping'
const TYPES = [TYPE_HOTEL, TYPE_COTTAGE, TYPE_HOSTEL, TYPE_CAMPING]

module.exports = (sequelize, DataTypes) => {
    let Hotel = sequelize.define('hotel', Object.assign({
        type: {
            type: DataTypes.ENUM,
            values: TYPES,
            allowNull: false
        },
    }, baseExtended), {
        timestamps: true,
        defaultScope: {
            where: {
                removed: false,
                actived: true
            }
        },
        indexes: [
            {
                unique: true,
                fields: ['name', 'userId']
            }
        ]
    })

    Hotel.associate = function (models) {
        Hotel.belongsTo(models.User)
        Hotel.belongsTo(models.Town)
    }

    Hotel.getAll = function ({ offset, limit }) {
        return this.findAll({ offset, limit })
    }

    Hotel.getOneBySlug = function (slug) {
        return this.findOne({ where: { slug } })
    }

    return Hotel
}
