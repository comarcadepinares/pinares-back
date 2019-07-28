'use strict'

const base = require('./_Base')

// const TYPE_HOTEL = 'hotel'
// const TYPE_COTTAGE = 'cottage'
// const TYPE_HOSTEL = 'hostel'
// const TYPE_CAMPING = 'camping'
// const TYPES = [TYPE_HOTEL, TYPE_COTTAGE, TYPE_HOSTEL, TYPE_CAMPING]

module.exports = (sequelize, DataTypes) => {
    let ActivityType = sequelize.define('activity_type', Object.assign({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, base), {
        timestamps: true,
        defaultScope: {
            where: {
                removed: false,
                actived: true
            }
        }
    })

    ActivityType.associate = function (models) {
        ActivityType.belongsTo(models.User)
    }

    ActivityType.getAll = function ({ offset, limit }) {
        return this.findAll({ offset, limit })
    }

    ActivityType.getOneBySlug = function (slug) {
        return this.findOne({ where: { slug } })
    }

    Object.assign(ActivityType.prototype, {
        getPublicInfo () {
            let publicInfo = {
                id: this.id,
                name: this.name,
                slug: this.slug,
                description: this.description,
                image: this.image
            }

            return publicInfo
        }
    })

    return ActivityType
}
