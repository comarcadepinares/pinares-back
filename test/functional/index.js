'use strict'

const expect = require('chai').expect
const request = require('supertest').agent(testApp)
const exception = requireRoot('services/customExceptions')
const debug = require('debug')('app:test:functional:index')

describe('FUNCTIONAL API - INDEX', function () {
    it('should response ok (status)', function (done) {
        request
            .get('/')
            .expect(200)
            .end(function (err, res) {
                expect(err).to.be.null
                expect(res.body).to.deep.equal({
                    'status': true,
                    'data': 'hi'
                })
                done()
            })
    })

    it('should response ko (not logged)', function (done) {
        let error = new exception.ValidationPublicKeyFailed()

        request
            .get('/logged')
            .expect(error.statusCode)
            .end(function (err, res) {
                expect(err).to.be.null
                expect(res.body).to.deep.equal({
                    'status': false,
                    'error': {
                        'code': error.code,
                        'message': error.message
                    }
                })
                done()
            })
    })

    it('should response 404 error', function (done) {
        let error = new exception.NotFoundError()

        request
            .get('/not-existing-endpoint')
            .expect(error.statusCode)
            .end(function (err, res) {
                expect(err).to.be.null
                expect(res.body).to.deep.equal({
                    'status': false,
                    'error': {
                        'code': error.code,
                        'message': error.message
                    }
                })
                done()
            })
    })
})
