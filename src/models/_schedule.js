'use strict'

const Sequelize = require('sequelize')
const schemaValidator = require('../services/db/schemaValidator')

module.exports = {
    schedule: {
        type: Sequelize.JSON,
        validate: {
            schema: schemaValidator({
                type: 'object',
                properties: {
                    monday: { type: 'array', properties: { start: { type: 'string' }, end: { type: 'string' } } },
                    tuesday: { type: 'array', properties: { start: { type: 'string' }, end: { type: 'string' } } },
                    wednesday: { type: 'array', properties: { start: { type: 'string' }, end: { type: 'string' } } },
                    thursday: { type: 'array', properties: { start: { type: 'string' }, end: { type: 'string' } } },
                    friday: { type: 'array', properties: { start: { type: 'string' }, end: { type: 'string' } } },
                    saturday: { type: 'array', properties: { start: { type: 'string' }, end: { type: 'string' } } },
                    sunday: { type: 'array', properties: { start: { type: 'string' }, end: { type: 'string' } } }
                }
            })
        },
        allowNull: true
    }
}
