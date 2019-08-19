'use strict'

const base = require('./_Base')

module.exports = (sequelize, DataTypes) => {
    let ActivityLine = sequelize.define('activity_line', Object.assign({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        line: {
            type: DataTypes.GEOMETRY('LINESTRING', 4326),
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
                if (instance.line && !instance.line.crs) {
                    instance.line.crs = {
                        type: 'name',
                        properties: { name: 'EPSG:4326' }
                    }
                }
            }
        }
    })

    ActivityLine.associate = function (models) {
        ActivityLine.belongsTo(models.User)
        ActivityLine.belongsTo(models.Town)
        ActivityLine.belongsTo(models.Activity)
        ActivityLine.belongsTo(models.ActivityOption)
    }

    ActivityLine.getOneById = function (id) {
        return this.findOne({ where: { id } })
    }

    ActivityLine.getAllByActivityOptionId = function (activityOptionId, { offset, limit } = { offset: 0, limit: 1000}) {
        return this.findAll({ where: { activityOptionId }, offset, limit })
    }

    Object.assign(ActivityLine.prototype, {
        getPublicInfo () {
            const line = this.line
            delete line.crs

            return {
                id: this.id,
                line,
                name: this.name
            }
        }
    })

    return ActivityLine
}
