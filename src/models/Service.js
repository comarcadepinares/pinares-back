'use strict'

const baseExtended = require('./_BaseExtended')

const TYPE_PHARMACY = 'pharmacy'
const TYPE_MEDICAL_CENTER = 'medical center'
const TYPE_BUTCHER_SHOP = 'butchers shop'
const TYPE_FISH_MARKET = 'fish market'
const TYPE_MARKET = 'market'
const TYPES = [TYPE_PHARMACY, TYPE_MEDICAL_CENTER, TYPE_BUTCHER_SHOP, TYPE_FISH_MARKET, TYPE_MARKET]

module.exports = (sequelize, DataTypes) => {
    let Service = sequelize.define('service', Object.assign({
        type: {
            type: DataTypes.ENUM,
            values: TYPES,
            allowNull: false
        }
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

    Service.associate = function (models) {
        Service.belongsTo(models.User)
        Service.belongsTo(models.Town)
    }

    Service.getAll = function ({ offset, limit }) {
        return this.findAll({ offset, limit })
    }

    Service.getOneBySlug = function (slug) {
        return this.findOne({ where: { slug } })
    }

    return Service
}
