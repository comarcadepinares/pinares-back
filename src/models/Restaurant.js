'use strict'

const baseExtended = require('./_BaseExtended')

module.exports = (sequelize, DataTypes) => {
    let Restaurant = sequelize.define('restaurant', baseExtended, {
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

    Restaurant.associate = function (models) {
        Restaurant.belongsTo(models.User)
        Restaurant.belongsTo(models.Town)
    }

    Restaurant.getAll = function ({ offset, limit }) {
        return this.findAll({ offset, limit })
    }

    Restaurant.getOneBySlug = function (slug) {
        return this.findOne({ where: { slug } })
    }

    Object.assign(Restaurant.prototype, {
        getPublicInfo () {
            const location = this.location
            delete location.crs

            let publicInfo = {
                id: this.id,
                name: this.name,
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


    return Restaurant
}
