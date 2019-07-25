'use strict'

const redis = requireRoot('services/db/redis')
const { getPoint } = requireRoot('services/geom')

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
    }
}
