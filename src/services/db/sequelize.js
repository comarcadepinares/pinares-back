const path = require('path')
const fs = require('fs')
const Sequelize = require('sequelize')
const debug = require('debug')('app:sequelize')
const parameters = requireRoot('../config/database')

const config = getConfig()

function getConfig () {
    if (process.env.PRO_MODE)
        return parameters.production
    else if (process.env.TEST_MODE)
        return parameters.test
    else
        return parameters.development
}

function initConnection () {
    return new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging,
        pool: config.pool
    })
}

async function initModels (sequelize) {
    const MODELS_PATH = path.resolve('src/models')

    const modelNames = fs.readdirSync(MODELS_PATH)
        .map(file => {
            if (file[0] !== '_') {
                return file.substring(0, file.lastIndexOf('.'))
            }
        })
        .filter(file => file)

    const models = {}
    modelNames.forEach(function (modelName) {
        const model = sequelize.import(path.resolve(MODELS_PATH, modelName))
        models[modelName] = model
    })

    for (let modelName in models) {
        const model = models[modelName]
        if ('associate' in model) { model.associate(models) }
    }

    return models
}

function isConnected (sequelize) {
    return sequelize.authenticate()
        .then(() => true)
        .catch(err => {
            debug('Connection error')
            throw err
        })
}

async function startClient () {
    const sequelize = initConnection()
    const models = await initModels(sequelize)

    return isConnected(sequelize)
        .then(status => {
            debug('connected')

            return sequelize.sync()
                .then(data => {
                    debug('sync')
                    return models
                })
                .catch(err => {
                    debug('sync error', err)
                })
        })
        .catch(err => {
            debug('error', err)
        })
}

module.exports = {
    startClient
}
