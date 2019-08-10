'use strict'

const Sequelize = require('sequelize')
const base = require('./_Base')

module.exports = Object.assign({
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    slug: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING(4096),
        allowNull: false
    },
    image: {
        type: Sequelize.STRING,
        allowNull: true
    },
    images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
    },
    location: {
        type: Sequelize.GEOMETRY('POINT', 4326),
        allowNull: true
    },
    address: {
        type: Sequelize.STRING,
        allowNull: true
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true
    },
    web: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, base)
