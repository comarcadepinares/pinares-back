'use strict';

const expect = require('chai').expect
const request = require('supertest').agent(testApp)
const faker = require('faker')
const { slugify } = requireRoot('services/utils')
const Service = requireRoot('appManager').models.Service
const { changeUserRole, getPoint } = require('../helper')
const exception = requireRoot('services/customExceptions')
const debug = require('debug')('app:test:functional:index')

let validUser
let validToken
let validService
let validTown
const pagination = {
    page: 1,
    limit: 25
}

describe('FUNCTIONAL API - SERVICE', function(){
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

        it('get service empty without token', function (done) {
            request
                .get('/service')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('services')
                    expect(res.body.data.services).to.be.an('Array').to.be.empty
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
            it('should response ok (add Service)', function (done) {
                validService = {
                    name: faker.lorem.sentence(),
                    townId: validTown.id,
                    type: 'pharmacy',
                    description: faker.lorem.sentence(),
                    location: getPoint(faker.address.latitude(), faker.address.longitude()),
                    address: faker.address.streetAddress(),
                    phone: faker.phone.phoneNumber(),
                    email: faker.internet.email(),
                    web: faker.internet.url()
                }

                request
                    .post('/service')
                    .set('Authorization', validToken)
                    .field('name', validService.name)
                    .field('townId', validService.townId)
                    .field('type', validService.type)
                    .field('description', validService.description)
                    .field('location', JSON.stringify(validService.location))
                    .field('address', validService.address)
                    .field('phone', validService.phone)
                    .field('email', validService.email)
                    .field('web', validService.web)
                    .attach('image', __dirname + '/../fixtures/duruelo.png')
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res.body.status).to.be.true
                        validService.slug = slugify(validService.name)
                        expect(res.body.data).to.have.property('id')
                        validService.id = res.body.data.id
                        expect(res.body.data).to.have.property('image')
                        validService.image = res.body.data.image
                        delete validService.townId
                        expect(res.body.data).to.be.deep.equal(validService)
                        done()
                    })
            })
        }

        it('should response ok (add Service without image)', function (done) {
            validService = {
                name: faker.lorem.sentence(),
                townId: validTown.id,
                type: 'pharmacy',
                description: faker.lorem.sentence(),
                location: getPoint(faker.address.latitude(), faker.address.longitude()),
                address: faker.address.streetAddress(),
                phone: faker.phone.phoneNumber(),
                email: faker.internet.email(),
                web: faker.internet.url(),
                image: null
            }

            request
                .post('/service')
                .set('Authorization', validToken)
                .send(validService)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    validService.slug = slugify(validService.name)
                    expect(res.body.data).to.have.property('id')
                    validService.id = res.body.data.id
                    expect(res.body.data).to.be.deep.equal(validService)
                    done()
                })
        })

        it('should fail adding Service invalid params', function (done) {
            const error = new exception.ValidationService()

            const invalidServices = [
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
                    type: 'pharmacy',
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
                    type: 'pharmacy',
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
            invalidServices.forEach(invalidService => {
                request
                    .post('/service')
                    .set('Authorization', validToken)
                    .send(invalidService)
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
                if (counter >= invalidServices.length) {
                    done()
                }
            })

        })

        it('should fail adding Service without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .post('/service')
                .field('name', validService.name)
                .field('description', validService.description)
                .field('location', JSON.stringify(validService.location))
                .field('address', validService.address)
                .field('phone', validService.phone)
                .field('email', validService.email)
                .field('web', validService.web)
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
                .get('/service')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('services')
                    expect(res.body.data.services).to.be.an('Array')
                    expect(res.body.data.services[0]).to.be.deep.equal(validService)
                    expect(res.body.data).to.have.property('pagination')
                    expect(res.body.data.pagination).to.be.deep.equal(pagination)
                    done()
                })
        })

        it('should response ok (content exists)', function (done) {
            request
                .get('/service/' + validService.slug)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validService)
                    done()
                })
        })

        it('should response ko (not exists)', function (done) {
            const error = new exception.EntityNotExists()

            request
                .get('/service/' + validService.slug + '-not-exists')
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

        it('should response ok (add service with the same name)', function (done) {
            validService.townId = validTown.id

            const error = new exception.EntityAlreadyExists()

            request
                .post('/service')
                .set('Authorization', validToken)
                .send(validService)
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

        it('should response ok (update Service)', function (done) {
            validService.townId = validTown.id

            validService.name = faker.lorem.sentence(),
            validService.description = faker.lorem.sentence()
            validService.location = getPoint(faker.address.latitude(), faker.address.longitude())
            validService.address = faker.address.streetAddress()
            validService.phone = faker.phone.phoneNumber()
            validService.email = faker.internet.email()
            validService.web = faker.internet.url()

            request
                .put('/service/' + validService.slug)
                .set('Authorization', validToken)
                .send(validService)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validService)
                    done()
                })
        })

        it('should response ok (update 2 fields)', function (done) {
            validService.townId = validTown.id

            validService.phone = faker.phone.phoneNumber()
            validService.email = null

            request
                .put('/service/' + validService.slug)
                .set('Authorization', validToken)
                .send(validService)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validService)
                    done()
                })
        })

        it('should fail updating without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .put('/service/' + validService.slug)
                .send(validService)
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

        it('should fail deleting service without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .delete('/service/' + validService.slug)
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

        it('should response ok (remove service)', function (done) {
            request
                .delete('/service/' + validService.slug)
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
                .get('/service/' + validService.slug)
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

        it('should response ok (get services after remove existing content)', function (done) {
            request
                .get('/service')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('services')
                    expect(res.body.data.services).to.be.an('Array').to.be.empty
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

        it('get service types', function (done) {
            request
            .get('/servicetypes')
            .set('Authorization', validToken)
            .expect(200)
            .end(function (err, res) {
                expect(err).to.be.null
                expect(res.body.status).to.be.true
                expect(res.body.data).to.have.property('types')
                expect(res.body.data.types).to.be.deep.equal(Service.TYPES)
                done()
            })
        })

        it('should work adding Service', function (done) {
            validService.townId = validTown.id
            validService.name = faker.lorem.sentence(),

            request
                .post('/service')
                .set('Authorization', validToken)
                .send(validService)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    validService.slug = slugify(validService.name)
                    expect(res.body.data).to.have.property('id')
                    validService.id = res.body.data.id
                    expect(res.body.data).to.have.property('image')
                    validService.image = res.body.data.image
                    expect(res.body.data).to.be.deep.equal(validService)
                    done()
                })
        })

        it('should work updating service', function (done) {
            validService.townId = validTown.id

            validService.description = faker.lorem.sentence()
            validService.location = getPoint(faker.address.latitude(), faker.address.longitude())
            validService.address = faker.address.streetAddress()
            validService.phone = faker.phone.phoneNumber()
            validService.email = faker.internet.email()
            validService.web = faker.internet.url()

            request
                .put('/service/' + validService.slug)
                .set('Authorization', validToken)
                .send(validService)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validService)
                    done()
                })
        })

        it('should work deleting service', function (done) {
            request
                .delete('/service/' + validService.slug)
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

    describe('Other user', function(){
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

        it('should fail updating Service if the user is not the owner', function (done) {
            let error = new exception.EntityNotExists()

            request
                .put('/service/' + validService.slug)
                .set('Authorization', validToken)
                .send(validService)
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

        it('should fail deleting Service if the user is not the owner', function (done) {
            let error = new exception.EntityNotExists()

            request
                .delete('/service/' + validService.slug)
                .set('Authorization', validToken)
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
    })
})
