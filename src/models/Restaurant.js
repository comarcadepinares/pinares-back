'use strict'

const baseExtended = require('./_BaseExtended')

module.exports = (sequelize, DataTypes) => {
    let Restaurant = sequelize.define('restaurant', Object.assign({
        highlight: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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

    Restaurant.associate = function (models) {
        Restaurant.belongsTo(models.User)
        Restaurant.belongsTo(models.Town)
    }

    Restaurant.getAll = function ({ offset, limit }, where) {
        return this.findAll({ offset, limit, where })
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


    return Restaurant
}
