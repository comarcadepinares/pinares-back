'use strict'

const express = require('express')
const multer = require('multer')({ dest: '/tmp/uploads/' })

const parameters = requireRoot('../parameters')
const auth = requireRoot('services/auth/auth')

const getTownMiddleware = require('./middlewares/getTown')
const getActivityTypeMiddleware = require('./middlewares/getActivityType')
const getActivityMiddleware = require('./middlewares/getActivity')
const getActivityOptionMiddleware = require('./middlewares/getActivityOption')
const getHotelMiddleware = require('./middlewares/getHotel')
const getRestaurantMiddleware = require('./middlewares/getRestaurant')
const getServiceMiddleware = require('./middlewares/getService')

const mainController = require('./controllers/mainController')
const authController = require('./controllers/authController')
const userController = require('./controllers/userController')
const townController = require('./controllers/townController')
const activityTypeController = require('./controllers/activityTypeController')
const activityController = require('./controllers/activityController')
const activityOptionController = require('./controllers/activityOptionController')
const hotelController = require('./controllers/hotelController')
const restaurantController = require('./controllers/restaurantController')
const serviceController = require('./controllers/serviceController')

module.exports = function (app) {
    // Test
    app.get('/', mainController.index)
    app.get('/logged', auth.validate, mainController.logged)

    // Auth
    let authRouter = express.Router({ mergeParams: true })
    app.use('/auth', authRouter)

    if (parameters.registerEnabled) {
        authRouter.post('/register', authController.register)
    }
    authRouter.post('/login', authController.login)
    authRouter.post('/change-password', auth.validate, authController.changePassword)

    // User
    let userRouter = express.Router({ mergeParams: true })
    app.use('/user', userRouter)

    userRouter.get('/', auth.validate, userController.getProfile)
    userRouter.put('/', auth.validate, userController.setProfile)

    // Town
    let townRouter = express.Router({ mergeParams: true })
    app.use('/town', townRouter)

    townRouter.get('/', townController.getAll)
    townRouter.get('/:slug', getTownMiddleware(), townController.getOne)
    townRouter.post('/', auth.validate, auth.superadmin, multer.single('image'), townController.create)
    townRouter.put('/:slug', auth.validate, auth.superadmin, multer.single('image'), getTownMiddleware(true), townController.update)
    townRouter.delete('/:slug', auth.validate, auth.superadmin, getTownMiddleware(true), townController.remove)

    // Town
    let activityTypeRouter = express.Router({ mergeParams: true })
    app.use('/activity-type', activityTypeRouter)

    activityTypeRouter.get('/', activityTypeController.getAll)
    activityTypeRouter.get('/:slug', getActivityTypeMiddleware(), activityTypeController.getOne)
    activityTypeRouter.post('/', auth.validate, auth.superadmin, multer.single('image'), activityTypeController.create)
    activityTypeRouter.put('/:slug', auth.validate, auth.superadmin, multer.single('image'), getActivityTypeMiddleware(true), activityTypeController.update)
    activityTypeRouter.delete('/:slug', auth.validate, auth.superadmin, getActivityTypeMiddleware(true), activityTypeController.remove)

    // Activity
    let activityRouter = express.Router({ mergeParams: true })
    app.use('/activity', activityRouter)

    activityRouter.get('/', activityController.getAll)
    activityRouter.get('/:slug', getActivityMiddleware(), activityController.getOne)
    activityRouter.post('/', auth.validate, multer.single('image'), activityController.create)
    activityRouter.put('/:slug', auth.validate, multer.single('image'), getActivityMiddleware(true), activityController.update)
    activityRouter.delete('/:slug', auth.validate, getActivityMiddleware(true), activityController.remove)
    activityRouter.post('/:slug/image', auth.validate, getActivityMiddleware(true), multer.single('image'), activityController.addImage)
    activityRouter.delete('/:slug/image', auth.validate, getActivityMiddleware(true), activityController.removeImage)

    // Activity options
    activityRouter.get('/:slug/option/', getActivityMiddleware(), activityOptionController.getAll)
    activityRouter.get('/:slug/option/:id', getActivityMiddleware(), getActivityOptionMiddleware(), activityOptionController.getOne)
    activityRouter.post('/:slug/option/', auth.validate, getActivityMiddleware(true), activityOptionController.create)
    activityRouter.put('/:slug/option/:id', auth.validate, getActivityMiddleware(true), getActivityOptionMiddleware(true), activityOptionController.update)
    activityRouter.delete('/:slug/option/:id', auth.validate, getActivityMiddleware(true), getActivityOptionMiddleware(true), activityOptionController.remove)

    let hotelRouter = express.Router({ mergeParams: true })
    app.use('/hotel', hotelRouter)

    app.get('/hoteltypes', auth.validate, hotelController.getTypes)
    hotelRouter.get('/', hotelController.getAll)
    hotelRouter.get('/:slug', getHotelMiddleware(), hotelController.getOne)
    hotelRouter.post('/', auth.validate, multer.single('image'), hotelController.create)
    hotelRouter.put('/:slug', auth.validate, multer.single('image'), getHotelMiddleware(true), hotelController.update)
    hotelRouter.delete('/:slug', auth.validate, getHotelMiddleware(true), hotelController.remove)
    hotelRouter.post('/:slug/image', auth.validate, getHotelMiddleware(true), multer.single('image'), hotelController.addImage)
    hotelRouter.delete('/:slug/image', auth.validate, getHotelMiddleware(true), hotelController.removeImage)

    // Restaurants
    let restaurantRouter = express.Router({ mergeParams: true })
    app.use('/restaurant', restaurantRouter)

    restaurantRouter.get('/', restaurantController.getAll)
    restaurantRouter.get('/:slug', getRestaurantMiddleware(), restaurantController.getOne)
    restaurantRouter.post('/', auth.validate, multer.single('image'), restaurantController.create)
    restaurantRouter.put('/:slug', auth.validate, multer.single('image'), getRestaurantMiddleware(true), restaurantController.update)
    restaurantRouter.delete('/:slug', auth.validate, getRestaurantMiddleware(true), restaurantController.remove)
    restaurantRouter.post('/:slug/image', auth.validate, getRestaurantMiddleware(true), multer.single('image'), restaurantController.addImage)
    restaurantRouter.delete('/:slug/image', auth.validate, getRestaurantMiddleware(true), restaurantController.removeImage)

    // Service
    let serviceRouter = express.Router({ mergeParams: true })
    app.use('/service', serviceRouter)

    app.get('/servicetypes', auth.validate, serviceController.getTypes)
    serviceRouter.get('/', serviceController.getAll)
    serviceRouter.get('/:slug', getServiceMiddleware(), serviceController.getOne)
    serviceRouter.post('/', auth.validate, multer.single('image'), serviceController.create)
    serviceRouter.put('/:slug', auth.validate, multer.single('image'), getServiceMiddleware(true), serviceController.update)
    serviceRouter.delete('/:slug', auth.validate, getServiceMiddleware(true), serviceController.remove)
    serviceRouter.post('/:slug/image', auth.validate, getServiceMiddleware(true), multer.single('image'), serviceController.addImage)
    serviceRouter.delete('/:slug/image', auth.validate, getServiceMiddleware(true), serviceController.removeImage)
}
