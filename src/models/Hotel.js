'use strict'

const baseExtended = require('./_BaseExtended')

const TYPE_HOTEL = 'hotel'
const TYPE_COTTAGE = 'cottage'
const TYPE_HOSTEL = 'hostel'
const TYPE_CAMPING = 'camping'
const TYPES = [TYPE_HOTEL, TYPE_COTTAGE, TYPE_HOSTEL, TYPE_CAMPING]

module.exports = (sequelize, DataTypes) => {
    let Hotel = sequelize.define('hotel', Object.assign({
        highlight: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
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

    Hotel.associate = function (models) {
        Hotel.belongsTo(models.User)
        Hotel.belongsTo(models.Town)
    }

    Hotel.getAll = function ({ offset, limit }, where) {
        return this.findAll({ offset, limit, where })
    }

    Hotel.getOneBySlug = function (slug) {
        return this.findOne({ where: { slug } })
    }

    Hotel.TYPES = TYPES

    Object.assign(Hotel.prototype, {
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
                images: this.images,
                location: this.location,
                address: this.address,
                phone: this.phone,
                email: this.email,
                web: this.web,
                townId: this.townId,
                highlight: this.highlight
            }

            return publicInfo
        }
    })

    return Hotel
}
