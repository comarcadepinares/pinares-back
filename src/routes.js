'use strict'

const express = require('express')
const multer = require('multer')({ dest: '/tmp/uploads/' })

const parameters = requireRoot('../parameters')
const auth = requireRoot('services/auth/auth')

const getTownMiddleware = require('./middlewares/getTown')

const mainController = require('./controllers/mainController')
const authController = require('./controllers/authController')
const userController = require('./controllers/userController')
const townController = require('./controllers/townController')

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
    townRouter.use(auth.validate)
    townRouter.use(auth.superadmin)
    app.use('/town', townRouter)

    townRouter.get('/', townController.getAll)
    townRouter.post('/', multer.single('image'), townController.create)
    townRouter.put('/:slug', multer.single('image'), getTownMiddleware(), townController.update)
    townRouter.get('/:slug', getTownMiddleware(), townController.getOne)
    townRouter.delete('/:slug', getTownMiddleware(), townController.remove)
}
