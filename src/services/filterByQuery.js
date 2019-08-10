'use strict'

const debug = require('debug')('app:services:filterByQuery')

const VALID_FIELDS = ['highlight']

module.exports = function (query) {
    const filter = {}

    for (const prop of VALID_FIELDS) {
        if (query[prop]) {
            filter[prop] = query[prop]
        }
    }

    debug(query, filter)

    return filter
}
