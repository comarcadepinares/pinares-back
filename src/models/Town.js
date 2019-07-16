'use strict'

const baseExtended = require('./_BaseExtended')

module.exports = (sequelize, DataTypes) => {
    let Town = sequelize.define('town', baseExtended, {
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

    Town.associate = function (models) {
        Town.belongsTo(models.User)
    }

    Town.getAll = function ({ offset, limit }) {
        return this.findAll({ offset, limit })
    }

    Town.getOneBySlug = function (slug) {
        return this.findOne({ where: { slug } })
    }


    Object.assign(Town.prototype, {
        getPublicInfo () {
            let publicInfo = {
                name: this.name,
                slug: this.slug,
                description: this.description,
                image: this.image,
                location: this.location,
                address: this.address,
                phone: this.phone,
                email: this.email,
                web: this.web
            }

            return publicInfo
        },
    })

    return Town
}
