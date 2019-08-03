'use strict'

const redis = requireRoot('services/db/redis')
const { getPoint, getLine } = requireRoot('services/geom')

module.exports = {
    async cleanDb () {
        const redisClient = redis.getClient()
        await redisClient.flushdbAsync()

        const models = requireRoot('../src/appManager').models
        // TODO: sequelize
        for (let modelName in models) {
            await models[modelName].destroy({ where: {}})
        }
    },

    async changeUserRole(email, role='SuperAdmin') {
        const User = requireRoot('./appManager').models.User
        let user = await User.findByEmail(email)
        user.role = role
        user.save()
    },

    getPoint(latitude, longitude) {
        return getPoint([parseFloat(latitude), parseFloat(longitude)])
    },

    getLine(latitude1, longitude1, latitude2, longitude2, latitude3, longitude3) {
        return getLine([
            [parseFloat(latitude1), parseFloat(longitude1)],
            [parseFloat(latitude2), parseFloat(longitude2)],
            [parseFloat(latitude3), parseFloat(longitude3)]
        ])
    }
}
