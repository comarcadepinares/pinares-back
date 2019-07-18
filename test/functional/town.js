'use strict';

const expect = require('chai').expect
const request = require('supertest').agent(testApp)
const faker = require('faker')
const { slugify } = requireRoot('services/utils')
const { getSuperAdminUser, getPoint } = require('../helper')
const exception = requireRoot('services/customExceptions')
const debug = require('debug')('app:test:functional:index')

let validUser
let validToken
let validTown
const pagination = {
    page: 1,
    limit: 25
}

describe.only('FUNCTIONAL API - CONTENT', function(){
    before(async function() {
        validUser = {
            "email": faker.internet.email().toLowerCase(),
            "password": faker.internet.password(),
            "username": faker.internet.userName().toLowerCase()
        }
    })

    it('should response ok (register)',function(done){
        let data = validUser

        request
            .post('/auth/register')
            .send(data)
            .expect(200)
            .end(function(err,res){
                expect(err).to.be.null
                expect(res.body.status).to.be.true
                expect(res.body.data).to.have.property('token')
                validToken = res.body.data.token
                expect(res.body.data).to.have.property('user')
                expect(res.body.data.user.email).to.be.equal(data.email)
                expect(res.body.data.user.email).to.be.equal(data.email)
                expect(res.body.data.user.username).to.be.equal(data.username)
                done()
            })
    })



    describe('superadmin', function() {
        before(async function() {
            await getSuperAdminUser(validUser.email)
        })

        it('should response ok (login with email)',function(done){
            let data = {
                "email": validUser.email,
                "password": validUser.password,
            }

            request
                .post('/auth/login')
                .send(data)
                .expect(200)
                .end(function(err,res){
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data.user.email).to.be.equal(validUser.email)
                    expect(res.body.data.user.username).to.be.equal(validUser.username)
                    expect(res.body.data.token).to.be.an('string')
                    validToken = res.body.data.token
                    done()
                })
        })

        it('should response ok (get town empty)', function (done) {
            request
                .get('/town')
                .set('Authorization', validToken)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('towns')
                    expect(res.body.data.towns).to.be.an('Array').to.be.empty
                    expect(res.body.data).to.have.property('pagination')
                    expect(res.body.data.pagination).to.be.deep.equal(pagination)
                    done()
                })
        })

        it('should response ok (add Town)', function (done) {
            let validTown = {
                name: faker.lorem.sentence(),
                description: faker.lorem.sentence(),
                location: getPoint(faker.address.latitude(), faker.address.longitude()),
                address: faker.address.streetAddress(),
                phone: faker.phone.phoneNumber(),
                email: faker.internet.email(),
                web: faker.internet.url()
            }

            request
                .post('/town')
                .set('Authorization', validToken)
                .field('name', validTown.name)
                .field('description', validTown.description)
                .field('location', JSON.stringify(validTown.location))
                .field('address', validTown.address)
                .field('phone', validTown.phone)
                .field('email', validTown.email)
                .field('web', validTown.web)
                .attach('image', __dirname + '/../fixtures/duruelo.png')
                .expect(200)
                .end(function (err, res) {
                    validTown.slug = slugify(validTown.name)
                    debug(res.body)
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validTown)
                    done()
                })
        })

        it('should response ok (add Town without image)', function (done) {
            let validTown = {
                name: faker.lorem.sentence(),
                description: faker.lorem.sentence(),
                image: null,
                location: getPoint(faker.address.latitude(), faker.address.longitude()),
                address: faker.address.streetAddress(),
                phone: faker.phone.phoneNumber(),
                email: faker.internet.email(),
                web: faker.internet.url()
            }

            request
                .post('/town')
                .set('Authorization', validToken)
                .field('name', validTown.name)
                .field('description', validTown.description)
                .field('location', JSON.stringify(validTown.location))
                .field('address', validTown.address)
                .field('phone', validTown.phone)
                .field('email', validTown.email)
                .field('web', validTown.web)
                .expect(200)
                .end(function (err, res) {
                    validTown.slug = slugify(validTown.name)
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validTown)
                    done()
                })
        })

        // it('should response ok (exists 1 content)', function (done) {
        //     request
        //         .get('/town')
        //         .set('X-device', 'aaa')
        //         .set('Authorization', validToken)
        //         .expect(200)
        //         .end(function (err, res) {
        //             expect(err).to.be.null
        //             expect(res.body.status).to.be.true
        //             expect(res.body.data).to.have.property('contents')
        //             expect(res.body.data.contents).to.be.an('Array')
        //             expect(res.body.data.contents[0]).to.be.deep.equal(validTown)
        //             expect(res.body.data).to.have.property('pagination')
        //             expect(res.body.data.pagination).to.be.deep.equal(pagination)
        //             done()
        //         })
        // })

        // it('should response ok (content exists)', function (done) {
        //     request
        //         .get('/town/' + validTown.slug)
        //         .set('X-device', 'aaa')
        //         .set('Authorization', validToken)
        //         .expect(200)
        //         .end(function (err, res) {
        //             expect(err).to.be.null
        //             expect(res.body.status).to.be.true
        //             expect(res.body.data).to.be.deep.equal(validTown)
        //             done()
        //         })
        // })

        // it('should response ko (content not exists)', function (done) {
        //     let error = new exception.TownNotExists()

        //     request
        //         .get('/town/' + validTown.slug + '-not-exists')
        //         .set('X-device', 'aaa')
        //         .set('Authorization', validToken)
        //         .expect(error.statusCode)
        //         .end(function (err, res) {
        //             expect(err).to.be.null
        //             expect(res.body).to.deep.equal({
        //                 "status": false,
        //                 "error": {
        //                     "code": error.code,
        //                     "message": error.message
        //                 }
        //             })
        //             done()
        //         })
        // })

        // it('should response ok (add content with the same name)', function (done) {
        //     let error = new exception.ValidationTownName()

        //     request
        //         .post('/town')
        //         .set('X-device', 'aaa')
        //         .set('Authorization', validToken)
        //         .send(validTown)
        //         .expect(error.statusCode)
        //         .end(function (err, res) {
        //             expect(err).to.be.null
        //             expect(res.body).to.deep.equal({
        //                 "status": false,
        //                 "error": {
        //                     "code": error.code,
        //                     "message": error.message
        //                 }
        //             })
        //             done()
        //         })
        // })

        // it('should response ok (remove content)', function (done) {
        //     request
        //         .delete('/town/' + validTown.slug)
        //         .set('X-device', 'aaa')
        //         .set('Authorization', validToken)
        //         .expect(200)
        //         .end(function (err, res) {
        //             expect(err).to.be.null
        //             expect(res.body.status).to.be.true
        //             expect(res.body.data).to.be.true
        //             done()
        //         })
        // })

        // it('should response ko (getting removed content)', function (done) {
        //     let error = new exception.TownNotExists()

        //     request
        //         .get('/town/' + validTown.slug)
        //         .set('X-device', 'aaa')
        //         .set('Authorization', validToken)
        //         .expect(error.statusCode)
        //         .end(function (err, res) {
        //             expect(err).to.be.null
        //             expect(res.body).to.deep.equal({
        //                 "status": false,
        //                 "error": {
        //                     "code": error.code,
        //                     "message": error.message
        //                 }
        //             })
        //             done()
        //         })
        // })

        // it('should response ok (get contents after remove existing content)', function (done) {
        //     request
        //         .get('/town')
        //         .set('X-device', 'aaa')
        //         .set('Authorization', validToken)
        //         .expect(200)
        //         .end(function (err, res) {
        //             expect(err).to.be.null
        //             expect(res.body.status).to.be.true
        //             expect(res.body.data).to.have.property('contents')
        //             expect(res.body.data.contents).to.be.an('Array').to.be.empty
        //             expect(res.body.data).to.have.property('pagination')
        //             expect(res.body.data.pagination).to.be.deep.equal(pagination)
        //             done()
        //         })
        // })
    })

})
