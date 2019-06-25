'use strict'

const baseExtended = require('./_BaseExtended')

module.exports = (sequelize, DataTypes) => {
    let Activity = sequelize.define('activity', Object.assign({
        geom: {
            type: DataTypes.GEOMETRY('LINESTRING', 4326),
            allowNull: true
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

    Activity.associate = function (models) {
        Activity.belongsTo(models.User)
        Activity.belongsTo(models.Town)
    }

    Activity.getAll = function ({ offset, limit }) {
        return this.findAll({ offset, limit })
    }

    Activity.getOneBySlug = function (slug) {
        return this.findOne({ where: { slug } })
    }

    return Activity
}
