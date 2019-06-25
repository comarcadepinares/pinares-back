'use strict'

const jwt = require('jsonwebtoken')
const parameters = requireRoot('../parameters')
const exception = requireRoot('services/customExceptions')
const TYPE = 'JWT '

module.exports = {
    generateAccessToken: (user) => {
        return TYPE + jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                random: Math.floor(Math.random() * 1000000)
            },
            parameters.secret,
            {
                expiresIn: parameters.tokenLife
            }
        )
    },

    async verify (token) {
        if (!token || token.indexOf(TYPE) !== 0) {
            throw new exception.ValidationPublicKeyFailed()
        }

        try {
            return jwt.verify(token.substring(TYPE.length), parameters.secret)
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw new exception.ValidationTokenExpired()
            }

            throw new exception.ValidationPublicKeyFailed()
        }
    }
}
