'use strict'

const userManager = requireRoot('managers/userManager')

module.exports = {

    async getProfile (req, res, next) {
        res.locals.response = userManager.getProfile(res.locals.user)
        next()
    },

    async setProfile (req, res, next) {
        res.locals.response = await userManager.setProfile(res.locals.user, req.body)
        next()
    }

}
