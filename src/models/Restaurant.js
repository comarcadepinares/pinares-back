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
                fields: ['name', 'userId']
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

    return Restaurant
}
