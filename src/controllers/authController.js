'use strict'

const authManager = requireRoot('managers/authManager')

module.exports = {

    async login (req, res, next) {
        const email = req.body.email
        const password = req.body.password
        const username = req.body.username

        try {
            res.locals.response = await authManager.login(email, username, password)
            next()
        } catch (error) {
            next(error)
        }
    },

    async register (req, res, next) {
        const email = req.body.email
        const password = req.body.password
        const username = req.body.username

        try {
            res.locals.response = await authManager.register(email, password, username)
            next()
        } catch (error) {
            next(error)
        }
    },

    async changePassword (req, res, next) {
        const email = req.body.email
        const password = req.body.password
        const newPassword = req.body.newPassword

        try {
            res.locals.response = await authManager.changePassword(email, password, newPassword)
            next()
        } catch (error) {
            next(error)
        }
    }

}
