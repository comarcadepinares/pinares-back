'use strict'

const bcrypt = require('bcrypt')
const redis = requireRoot('services/db/redis')
const base = require('./_Base')
const schemaValidator = require('../services/db/schemaValidator')

function processPassword (user) {
    const SALT_FACTOR = 5

    return new Promise((resolve, reject) => {
        bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
            if (err) reject(err)

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) reject(err)
                user.password = hash
                resolve()
            })
        })
    })
}

const TYPE_CLIENT = 'Client'
const TYPE_ADMIN = 'SuperAdmin'
const TYPES = [TYPE_CLIENT, TYPE_ADMIN]

module.exports = (sequelize, DataTypes) => {
    let User = sequelize.define('user', Object.assign({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM,
            values: TYPES,
            defaultValue: TYPE_CLIENT,
            allowNull: false
        },
        profile: {
            type: DataTypes.JSON,
            validate: {
                schema: schemaValidator({
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        lastname: { type: 'string' },
                        image: { type: 'string' }
                    }
                })
            }
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
            beforeCreate (user, options) {
                return processPassword(user)
            },

            beforeUpdate (user, options) {
                if (user.changed('password')) {
                    return processPassword(user)
                }
            }
        }
    })

    User.findByEmail = function (email) {
        return this.findOne({ where: { email } })
    }

    /*
     * INSTANCE METHODS
     */
    Object.assign(User.prototype, {
        comparePassword (candidatePassword) {
            return new Promise((resolve, reject) => {
                bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
                    if (err || !isMatch) {
                        resolve(false)
                    }

                    resolve(true)
                })
            })
        },

        setPassword (password) {
            this.password = password
        },

        getPublicInfo () {
            let publicInfo = {
                email: this.email,
                username: this.username,
                role: this.role
            }

            if (this.profile) { publicInfo.profile = this.profile }

            return publicInfo
        },

        addToken (newToken) {
            const redisKey = this.id + ':tokens'
            const redisClient = redis.getClient()
            return redisClient.getAsync(redisKey)
                .then(tokensString => {
                    let tokens = JSON.parse(tokensString)

                    if (!tokens || !tokens.length) {
                        tokens = []
                    }

                    tokens.push({
                        token: newToken
                    })

                    return tokens
                })
                .then(tokens => {
                    // save tokens
                    redisClient.set(redisKey, JSON.stringify(tokens))
                })
        },

        removeAllTokens () {
            const redisKey = this.id + ':tokens'
            const redisClient = redis.getClient()
            redisClient.del(redisKey)
        },

        isSuperAdmin () {
            return this.role === USER_TYPE_ADMIN
        },
    })

    return User
}
