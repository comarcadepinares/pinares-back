'use strict'

const base = require('./_Base')

module.exports = (sequelize, DataTypes) => {
    let ActivityPoint = sequelize.define('activity_point', Object.assign({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        point: {
            type: DataTypes.GEOMETRY('POINT', 4326),
            allowNull: false
        }
    }, base), {
        timestamps: true,
        defaultScope: {
            where: {
                removed: false,
                actived: true
            }
        },
        hooks: {
            beforeSave: function (instance) {
                if (instance.point && !instance.point.crs) {
                    instance.point.crs = {
                        type: 'name',
                        properties: { name: 'EPSG:4326' }
                    }
                }
            }
        }
    })

    ActivityPoint.associate = function (models) {
        ActivityPoint.belongsTo(models.User)
        ActivityPoint.belongsTo(models.Town)
        ActivityPoint.belongsTo(models.Activity)
        ActivityPoint.belongsTo(models.ActivityOption)
    }

    ActivityPoint.getOneById = function (id) {
        return this.findOne({ where: { id } })
    }

    ActivityPoint.getAllByActivityOptionId = function (activityOptionId, { offset, limit } = { offset: 0, limit: 1000 }) {
        return this.findAll({ where: { activityOptionId }, offset, limit })
    }

    Object.assign(ActivityPoint.prototype, {
        getPublicInfo() {
            const point = this.point
            delete point.crs

            return {
                id: this.id,
                point,
                name: this.name
            }
        }
    })

    return ActivityPoint
}
