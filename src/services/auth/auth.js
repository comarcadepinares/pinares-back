'use strict'

const jwt = require('./jwt')
const redis = requireRoot('services/db/redis')
const redisClient = redis.getClient()
const exception = requireRoot('services/customExceptions')
const User = requireRoot('./appManager').models.User

module.exports = {

    async validate (req, res, next) {
        const token = req.get('Authorization')

        // verify token
        const tokenDecoded = await jwt.verify(token)
        if (!tokenDecoded ||
            !tokenDecoded.id ||
            !tokenDecoded.username ||
            !tokenDecoded.role
        ) {
            throw new exception.ValidationPublicKeyFailed()
        }

        // verify in redis
        const userFromRedis = await verifyInRedis(token, tokenDecoded.id)
        if (!userFromRedis) {
            throw new exception.ValidationPublicKeyFailed()
        }

        // get user from db
        const user = await User.findOne({
            where: {
                id: tokenDecoded.id,
                username: tokenDecoded.username,
                role: tokenDecoded.role
            }
        })

        if (!user) {
            throw new exception.ValidationPublicKeyFailed()
        }

        res.locals.user = user

        next()
    },

    superadmin (req, res, next) {
        if (!res.locals.user || !res.locals.user.isSuperAdmin()) {
            throw new exception.ValidationSuperadmin()
        }

        next()
    }
}

function verifyInRedis (tokenReceived, userId) {
    const redisKey = userId + ':tokens'

    return redisClient.getAsync(redisKey).then(tokensString => {
        const tokens = JSON.parse(tokensString)

        if (!tokens || !tokens.length) {
            return false
        } else {
            let existingToken = false

            for (const token of tokens) {
                if (token.token === tokenReceived) {
                    existingToken = true
                    break
                }
            }

            return existingToken
        }
    })
}
