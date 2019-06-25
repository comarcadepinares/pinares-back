'use strict'

const authManager = requireRoot('managers/authManager')

module.exports = {

    async login (req, res) {
        const email = req.body.email
        const password = req.body.password
        const username = req.body.username

        return authManager.login(email, username, password)
    },

    async register (req, res) {
        const email = req.body.email
        const password = req.body.password
        const username = req.body.username

        return authManager.register(email, password, username)
    },

    async changePassword (req, res) {
        const email = req.body.email
        const password = req.body.password
        const newPassword = req.body.newPassword

        return authManager.changePassword(email, password, newPassword)
    }

}
