'use strict'

const express = require('express')
const multer = require('multer')({ dest: '/tmp/uploads/' })

const parameters = requireRoot('../parameters')
const auth = requireRoot('services/auth/auth')

const getTownMiddleware = require('./middlewares/getTown')
const getActivityTypeMiddleware = require('./middlewares/getActivityType')
const getHotelMiddleware = require('./middlewares/getHotel')
const getRestaurantMiddleware = require('./middlewares/getRestaurant')
const getServiceMiddleware = require('./middlewares/getService')

const mainController = require('./controllers/mainController')
const authController = require('./controllers/authController')
const userController = require('./controllers/userController')
const townController = require('./controllers/townController')
const activityTypeController = require('./controllers/activityTypeController')
const hotelController = require('./controllers/hotelController')
const restaurantController = require('./controllers/restaurantController')
const serviceController = require('./controllers/serviceController')

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
    townRouter.put('/:slug', auth.validate, auth.superadmin, multer.single('image'), getTownMiddleware(true), townController.update)
    townRouter.delete('/:slug', auth.validate, auth.superadmin, getTownMiddleware(true), townController.remove)

    // Town routes
    let activityTypeRouter = express.Router({ mergeParams: true })
    app.use('/activity-type', activityTypeRouter)

    activityTypeRouter.get('/', activityTypeController.getAll)
    activityTypeRouter.get('/:slug', getActivityTypeMiddleware(), activityTypeController.getOne)
    activityTypeRouter.post('/', auth.validate, auth.superadmin, multer.single('image'), activityTypeController.create)
    activityTypeRouter.put('/:slug', auth.validate, auth.superadmin, multer.single('image'), getActivityTypeMiddleware(true), activityTypeController.update)
    activityTypeRouter.delete('/:slug', auth.validate, auth.superadmin, getActivityTypeMiddleware(true), activityTypeController.remove)

    // Hotel routes
    let hotelRouter = express.Router({ mergeParams: true })
    app.use('/hotel', hotelRouter)

    app.get('/hoteltypes', auth.validate, hotelController.getTypes)
    hotelRouter.get('/', hotelController.getAll)
    hotelRouter.get('/:slug', getHotelMiddleware(), hotelController.getOne)
    hotelRouter.post('/', auth.validate, multer.single('image'), hotelController.create)
    hotelRouter.put('/:slug', auth.validate, multer.single('image'), getHotelMiddleware(true), hotelController.update)
    hotelRouter.delete('/:slug', auth.validate, getHotelMiddleware(true), hotelController.remove)

    // Restaurants routes
    let restaurantRouter = express.Router({ mergeParams: true })
    app.use('/restaurant', restaurantRouter)

    restaurantRouter.get('/', restaurantController.getAll)
    restaurantRouter.get('/:slug', getRestaurantMiddleware(), restaurantController.getOne)
    restaurantRouter.post('/', auth.validate, multer.single('image'), restaurantController.create)
    restaurantRouter.put('/:slug', auth.validate, multer.single('image'), getRestaurantMiddleware(true), restaurantController.update)
    restaurantRouter.delete('/:slug', auth.validate, getRestaurantMiddleware(true), restaurantController.remove)

    // Service routes
    let serviceRouter = express.Router({ mergeParams: true })
    app.use('/service', serviceRouter)

    app.get('/servicetypes', auth.validate, serviceController.getTypes)
    serviceRouter.get('/', serviceController.getAll)
    serviceRouter.get('/:slug', getServiceMiddleware(), serviceController.getOne)
    serviceRouter.post('/', auth.validate, multer.single('image'), serviceController.create)
    serviceRouter.put('/:slug', auth.validate, multer.single('image'), getServiceMiddleware(true), serviceController.update)
    serviceRouter.delete('/:slug', auth.validate, getServiceMiddleware(true), serviceController.remove)
}
