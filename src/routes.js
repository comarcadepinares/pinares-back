'use strict'

const express = require('express')
const multer = require('multer')({ dest: '/tmp/uploads/' })

const parameters = requireRoot('../parameters')
const auth = requireRoot('services/auth/auth')

const getTownMiddleware = require('./middlewares/getTown')
const getHotelMiddleware = require('./middlewares/getHotel')

const mainController = require('./controllers/mainController')
const authController = require('./controllers/authController')
const userController = require('./controllers/userController')
const townController = require('./controllers/townController')
const hotelController = require('./controllers/hotelController')

module.exports = function (app) {
    // Test routes
    app.get('/', mainController.index)
    app.get('/logged', auth.validate, mainController.logged)

    // Auth routes
    let authRouter = express.Router({ mergeParams: true })
    app.use('/auth', authRouter)

    if (parameters.registerEnabled) {
        authRouter.post('/register', authController.register)
    }
    authRouter.post('/login', authController.login)
    authRouter.post('/change-password', auth.validate, authController.changePassword)

    // User routes
    let userRouter = express.Router({ mergeParams: true })
    app.use('/user', userRouter)

    userRouter.get('/', auth.validate, userController.getProfile)
    userRouter.put('/', auth.validate, userController.setProfile)

    // Town routes
    let townRouter = express.Router({ mergeParams: true })
    app.use('/town', townRouter)

    townRouter.get('/', townController.getAll)
    townRouter.get('/:slug', getTownMiddleware(), townController.getOne)
    townRouter.post('/', auth.validate, auth.superadmin, multer.single('image'), townController.create)
    townRouter.put('/:slug', auth.validate, auth.superadmin, multer.single('image'), getTownMiddleware(), townController.update)
    townRouter.delete('/:slug', auth.validate, auth.superadmin, getTownMiddleware(), townController.remove)

    // Hotel routes
    let hotelRouter = express.Router({ mergeParams: true })
    app.use('/hotel', hotelRouter)

    hotelRouter.get('/', hotelController.getAll)
    hotelRouter.get('/:slug', getHotelMiddleware(), hotelController.getOne)
    hotelRouter.post('/', auth.validate, multer.single('image'), hotelController.create)
    hotelRouter.put('/:slug', auth.validate, multer.single('image'), getHotelMiddleware(), hotelController.update)
    hotelRouter.delete('/:slug', auth.validate, getHotelMiddleware(), hotelController.remove)
}
