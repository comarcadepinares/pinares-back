'use strict'

const baseExtended = require('./_BaseExtended')

module.exports = (sequelize, DataTypes) => {
    let Activity = sequelize.define('activity', Object.assign({
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

    Activity.associate = function (models) {
        Activity.belongsTo(models.User)
        Activity.belongsTo(models.Town)
        Activity.belongsTo(models.ActivityType)
        Activity.hasMany(models.ActivityOption)
    }

    Activity.getAll = function ({ offset, limit }, where) {
        return this.findAll({ offset, limit, where })
    }

    Activity.getOneBySlug = function (slug) {
        return this.findOne({ where: { slug } })
    }

    Object.assign(Activity.prototype, {
        getPublicInfo () {
            const location = this.location
            delete location.crs

            let publicInfo = {
                id: this.id,
                activityTypeId: this.activityTypeId,
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


    return Activity
}
