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

    return Town
}
