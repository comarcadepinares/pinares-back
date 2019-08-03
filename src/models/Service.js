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
                fields: ['slug']
            },
            {
                unique: true,
                fields: ['name', 'townId']
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

    Service.TYPES = TYPES

    Object.assign(Service.prototype, {
        getPublicInfo () {
            const location = this.location
            delete location.crs

            let publicInfo = {
                id: this.id,
                name: this.name,
                type: this.type,
                slug: this.slug,
                description: this.description,
                image: this.image,
                location: this.location,
                address: this.address,
                phone: this.phone,
                email: this.email,
                web: this.web,
                townId: this.townId
            }

            return publicInfo
        }
    })

    return Service
}
