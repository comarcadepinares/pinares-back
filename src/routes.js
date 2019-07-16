'use strict'

const express = require('express')
const auth = requireRoot('services/auth/auth')
const parameters = requireRoot('../parameters')
const customExceptions = requireRoot('services/customExceptions')

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
    expressDeliver(townRouter, {
        exceptionPool: customExceptions,
        printErrorStack: parameters.expressDeliver.printErrorStack,
        printInternalErrorData: parameters.expressDeliver.printInternalErrorData
    })
    townRouter.use(auth.validate)
    townRouter.use(auth.superadmin)
    app.use('/town', townRouter)

    townRouter.get('/', townController.getAll)
    // contentRouter.post('/', contentController.create)
    // contentRouter.get('/:contentSlug', getContentMiddleware(), contentController.getOne)
    // contentRouter.delete('/:contentSlug', getContentMiddleware(), contentController.remove)

}
