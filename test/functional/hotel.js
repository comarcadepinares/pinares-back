'use strict';

const expect = require('chai').expect
const request = require('supertest').agent(testApp)
const faker = require('faker')
const { slugify } = requireRoot('services/utils')
const { changeUserRole, getPoint } = require('../helper')
const exception = requireRoot('services/customExceptions')
const debug = require('debug')('app:test:functional:index')

let validUser
let validToken
let validHotel
let validTown
const pagination = {
    page: 1,
    limit: 25
}

describe('FUNCTIONAL API - CONTENT', function(){
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
            await changeUserRole(validUser.email, 'SuperAdmin')
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

        it('get hotel empty without token', function (done) {
            request
                .get('/hotel')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('hotels')
                    expect(res.body.data.hotels).to.be.an('Array').to.be.empty
                    expect(res.body.data).to.have.property('pagination')
                    expect(res.body.data.pagination).to.be.deep.equal(pagination)
                    done()
                })
        })

        it('add Town', function (done) {
            validTown = {
                name: faker.lorem.sentence(),
                description: faker.lorem.sentence(),
                location: getPoint(faker.address.latitude(), faker.address.longitude()),
                address: faker.address.streetAddress(),
                phone: faker.phone.phoneNumber(),
                email: faker.internet.email(),
                web: faker.internet.url(),
                image: null
            }

            request
                .post('/town')
                .set('Authorization', validToken)
                .send(validTown)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    validTown.slug = slugify(validTown.name)
                    expect(res.body.data).to.have.property('id')
                    validTown.id = res.body.data.id
                    expect(res.body.data).to.be.deep.equal(validTown)
                    done()
                })
        })

        if (process.env.PB_AWS_CONF) {
            it('should response ok (add Hotel)', function (done) {
                validHotel = {
                    name: faker.lorem.sentence(),
                    townId: validTown.id,
                    type: 'hotel',
                    description: faker.lorem.sentence(),
                    location: getPoint(faker.address.latitude(), faker.address.longitude()),
                    address: faker.address.streetAddress(),
                    phone: faker.phone.phoneNumber(),
                    email: faker.internet.email(),
                    web: faker.internet.url()
                }

                request
                    .post('/hotel')
                    .set('Authorization', validToken)
                    .field('name', validHotel.name)
                    .field('townId', validHotel.townId)
                    .field('type', validHotel.type)
                    .field('description', validHotel.description)
                    .field('location', JSON.stringify(validHotel.location))
                    .field('address', validHotel.address)
                    .field('phone', validHotel.phone)
                    .field('email', validHotel.email)
                    .field('web', validHotel.web)
                    .attach('image', __dirname + '/../fixtures/duruelo.png')
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res.body.status).to.be.true
                        validHotel.slug = slugify(validHotel.name)
                        expect(res.body.data).to.have.property('id')
                        validHotel.id = res.body.data.id
                        expect(res.body.data).to.have.property('image')
                        validHotel.image = res.body.data.image
                        delete validHotel.townId
                        expect(res.body.data).to.be.deep.equal(validHotel)
                        done()
                    })
            })
        }

        it('should response ok (add Hotel without image)', function (done) {
            validHotel = {
                name: faker.lorem.sentence(),
                townId: validTown.id,
                type: 'hotel',
                description: faker.lorem.sentence(),
                location: getPoint(faker.address.latitude(), faker.address.longitude()),
                address: faker.address.streetAddress(),
                phone: faker.phone.phoneNumber(),
                email: faker.internet.email(),
                web: faker.internet.url(),
                image: null
            }

            request
                .post('/hotel')
                .set('Authorization', validToken)
                .send(validHotel)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    validHotel.slug = slugify(validHotel.name)
                    expect(res.body.data).to.have.property('id')
                    validHotel.id = res.body.data.id
                    delete validHotel.townId
                    expect(res.body.data).to.be.deep.equal(validHotel)
                    done()
                })
        })

        it('should fail adding Hotel invalid params', function (done) {
            const error = new exception.ValidationHotel()

            const invalidHotels = [
                {
                    name: faker.lorem.sentence(),
                    townId: validTown.id,
                    description: faker.lorem.sentence(),
                    location: getPoint(faker.address.latitude(), faker.address.longitude()),
                    address: faker.address.streetAddress(),
                    phone: faker.phone.phoneNumber(),
                    email: faker.internet.email(),
                    web: faker.internet.url(),
                    image: null
                },
                {
                    name: faker.lorem.sentence(),
                    type: '',
                    townId: validTown.id,
                    description: faker.lorem.sentence(),
                    location: getPoint(faker.address.latitude(), faker.address.longitude()),
                    address: faker.address.streetAddress(),
                    phone: faker.phone.phoneNumber(),
                    email: faker.internet.email(),
                    web: faker.internet.url(),
                    image: null
                },
                {
                    name: faker.lorem.sentence(),
                    type: 'fake',
                    townId: validTown.id,
                    description: faker.lorem.sentence(),
                    location: getPoint(faker.address.latitude(), faker.address.longitude()),
                    address: faker.address.streetAddress(),
                    phone: faker.phone.phoneNumber(),
                    email: faker.internet.email(),
                    web: faker.internet.url(),
                    image: null
                },
                {
                    name: faker.lorem.sentence(),
                    type: 'hotel',
                    description: faker.lorem.sentence(),
                    location: getPoint(faker.address.latitude(), faker.address.longitude()),
                    address: faker.address.streetAddress(),
                    phone: faker.phone.phoneNumber(),
                    email: faker.internet.email(),
                    web: faker.internet.url(),
                    image: null
                },
                {
                    name: faker.lorem.sentence(),
                    type: 'hotel',
                    townId: 0,
                    description: faker.lorem.sentence(),
                    location: getPoint(faker.address.latitude(), faker.address.longitude()),
                    address: faker.address.streetAddress(),
                    phone: faker.phone.phoneNumber(),
                    email: faker.internet.email(),
                    web: faker.internet.url(),
                    image: null
                }
            ]

            let counter = 0
            invalidHotels.forEach(invalidHotel => {
                request
                    .post('/hotel')
                    .set('Authorization', validToken)
                    .send(invalidHotel)
                    .expect(error.statusCode)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res.body).to.deep.equal({
                            "status": false,
                            "error": {
                                "code": error.code,
                                "message": error.message
                            }
                        })
                    })

                counter++
                if (counter >= invalidHotels.length) {
                    done()
                }
            })

        })

        it('should fail adding Hotel without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .post('/hotel')
                .field('name', validHotel.name)
                .field('description', validHotel.description)
                .field('location', JSON.stringify(validHotel.location))
                .field('address', validHotel.address)
                .field('phone', validHotel.phone)
                .field('email', validHotel.email)
                .field('web', validHotel.web)
                .expect(error.statusCode)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body).to.deep.equal({
                        "status": false,
                        "error": {
                            "code": error.code,
                            "message": error.message
                        }
                    })
                    done()
                })
        })

        it('should response ok (exists 1)', function (done) {
            request
                .get('/hotel')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('hotels')
                    expect(res.body.data.hotels).to.be.an('Array')
                    expect(res.body.data.hotels[0]).to.be.deep.equal(validHotel)
                    expect(res.body.data).to.have.property('pagination')
                    expect(res.body.data.pagination).to.be.deep.equal(pagination)
                    done()
                })
        })

        it('should response ok (content exists)', function (done) {
            request
                .get('/hotel/' + validHotel.slug)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validHotel)
                    done()
                })
        })

        it('should response ko (not exists)', function (done) {
            const error = new exception.EntityNotExists()

            request
                .get('/hotel/' + validHotel.slug + '-not-exists')
                .expect(error.statusCode)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body).to.deep.equal({
                        "status": false,
                        "error": {
                            "code": error.code,
                            "message": error.message
                        }
                    })
                    done()
                })
        })

        it('should response ok (add hotel with the same name)', function (done) {
            validHotel.townId = validTown.id

            const error = new exception.EntityAlreadyExists()

            request
                .post('/hotel')
                .set('Authorization', validToken)
                .send(validHotel)
                .expect(error.statusCode)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body).to.deep.equal({
                        "status": false,
                        "error": {
                            "code": error.code,
                            "message": error.message
                        }
                    })
                    done()
                })
        })

        it('should response ok (update Hotel)', function (done) {
            validHotel.townId = validTown.id

            validHotel.description = faker.lorem.sentence()
            validHotel.location = getPoint(faker.address.latitude(), faker.address.longitude())
            validHotel.address = faker.address.streetAddress()
            validHotel.phone = faker.phone.phoneNumber()
            validHotel.email = faker.internet.email()
            validHotel.web = faker.internet.url()

            request
                .put('/hotel/' + validHotel.slug)
                .set('Authorization', validToken)
                .send(validHotel)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    delete validHotel.townId
                    expect(res.body.data).to.be.deep.equal(validHotel)
                    done()
                })
        })

        it('should response ok (update 2 fields)', function (done) {
            validHotel.townId = validTown.id

            validHotel.phone = faker.phone.phoneNumber()
            validHotel.email = null

            request
                .put('/hotel/' + validHotel.slug)
                .set('Authorization', validToken)
                .send(validHotel)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    delete validHotel.townId
                    expect(res.body.data).to.be.deep.equal(validHotel)
                    done()
                })
        })

        it('should fail updating without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .put('/hotel/' + validHotel.slug)
                .send(validHotel)
                .expect(error.statusCode)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body).to.deep.equal({
                        "status": false,
                        "error": {
                            "code": error.code,
                            "message": error.message
                        }
                    })
                    done()
                })
        })

        it('should fail deleting hotel without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .delete('/hotel/' + validHotel.slug)
                .expect(error.statusCode)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body).to.deep.equal({
                        "status": false,
                        "error": {
                            "code": error.code,
                            "message": error.message
                        }
                    })
                    done()
                })
        })

        it('should response ok (remove hotel)', function (done) {
            request
                .delete('/hotel/' + validHotel.slug)
                .set('Authorization', validToken)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.true
                    done()
                })
        })

        it('should response ko (getting removed content)', function (done) {
            let error = new exception.EntityNotExists()

            request
                .get('/hotel/' + validHotel.slug)
                .expect(error.statusCode)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body).to.deep.equal({
                        "status": false,
                        "error": {
                            "code": error.code,
                            "message": error.message
                        }
                    })
                    done()
                })
        })

        it('should response ok (get hotels after remove existing content)', function (done) {
            request
                .get('/hotel')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('hotels')
                    expect(res.body.data.hotels).to.be.an('Array').to.be.empty
                    expect(res.body.data).to.have.property('pagination')
                    expect(res.body.data.pagination).to.be.deep.equal(pagination)
                    done()
                })
        })
    })

    describe('client', function() {
        before(async function() {
            await changeUserRole(validUser.email, 'Client')
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

        it('should work adding Hotel', function (done) {
            validHotel.townId = validTown.id
            validHotel.name = faker.lorem.sentence(),

            request
                .post('/hotel')
                .set('Authorization', validToken)
                .send(validHotel)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    validHotel.slug = slugify(validHotel.name)
                    expect(res.body.data).to.have.property('id')
                    validHotel.id = res.body.data.id
                    expect(res.body.data).to.have.property('image')
                    validHotel.image = res.body.data.image
                    delete validHotel.townId
                    expect(res.body.data).to.be.deep.equal(validHotel)
                    done()
                })
        })

        it('should work updating hotel', function (done) {
            validHotel.townId = validTown.id

            validHotel.description = faker.lorem.sentence()
            validHotel.location = getPoint(faker.address.latitude(), faker.address.longitude())
            validHotel.address = faker.address.streetAddress()
            validHotel.phone = faker.phone.phoneNumber()
            validHotel.email = faker.internet.email()
            validHotel.web = faker.internet.url()

            request
                .put('/hotel/' + validHotel.slug)
                .set('Authorization', validToken)
                .send(validHotel)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    delete validHotel.townId
                    expect(res.body.data).to.be.deep.equal(validHotel)
                    done()
                })
        })

        it('should work deleting hotel', function (done) {
            request
                .delete('/hotel/' + validHotel.slug)
                .set('Authorization', validToken)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.true
                    done()
                })
        })
    })
})
