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

        it('get town empty without token', function (done) {
            request
                .get('/town')
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

        if (process.env.PB_AWS_CONF) {
            it('should response ok (add Town)', function (done) {
                validTown = {
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
                        expect(err).to.be.null
                        expect(res.body.status).to.be.true
                        validTown.slug = slugify(validTown.name)
                        expect(res.body.data).to.have.property('id')
                        validTown.id = res.body.data.id
                        expect(res.body.data).to.have.property('image')
                        validTown.image = res.body.data.image
                        expect(res.body.data).to.be.deep.equal(validTown)
                        done()
                    })
            })
        }

        it('should response ok (add Town without image)', function (done) {
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
                .field('name', validTown.name)
                .field('description', validTown.description)
                .field('location', JSON.stringify(validTown.location))
                .field('address', validTown.address)
                .field('phone', validTown.phone)
                .field('email', validTown.email)
                .field('web', validTown.web)
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

        it('should fail adding Town without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .post('/town')
                .field('name', validTown.name)
                .field('description', validTown.description)
                .field('location', JSON.stringify(validTown.location))
                .field('address', validTown.address)
                .field('phone', validTown.phone)
                .field('email', validTown.email)
                .field('web', validTown.web)
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
                .get('/town')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('towns')
                    expect(res.body.data.towns).to.be.an('Array')
                    expect(res.body.data.towns[0]).to.be.deep.equal(validTown)
                    expect(res.body.data).to.have.property('pagination')
                    expect(res.body.data.pagination).to.be.deep.equal(pagination)
                    done()
                })
        })

        it('should response ok (content exists)', function (done) {
            request
                .get('/town/' + validTown.slug)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validTown)
                    done()
                })
        })

        it('should response ko (not exists)', function (done) {
            const error = new exception.EntityNotExists()

            request
                .get('/town/' + validTown.slug + '-not-exists')
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

        it('should response ok (add town with the same name)', function (done) {
            const error = new exception.EntityAlreadyExists()

            request
                .post('/town')
                .set('Authorization', validToken)
                .send(validTown)
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

        it('should response ok (update Town)', function (done) {
            validTown.description = faker.lorem.sentence()
            validTown.location = getPoint(faker.address.latitude(), faker.address.longitude())
            validTown.address = faker.address.streetAddress()
            validTown.phone = faker.phone.phoneNumber()
            validTown.email = faker.internet.email()
            validTown.web = faker.internet.url()

            request
                .put('/town/' + validTown.slug)
                .set('Authorization', validToken)
                .field('description', validTown.description)
                .field('location', JSON.stringify(validTown.location))
                .field('address', validTown.address)
                .field('phone', validTown.phone)
                .field('email', validTown.email)
                .field('web', validTown.web)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validTown)
                    done()
                })
        })

        it('should response ok (update 2 fields)', function (done) {
            validTown.phone = faker.phone.phoneNumber()
            validTown.email = null

            request
                .put('/town/' + validTown.slug)
                .set('Authorization', validToken)
                .send(validTown)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validTown)
                    done()
                })
        })

        it('should fail updating without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .put('/town/' + validTown.slug)
                .send(validTown)
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

        it('should fail deleting town without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .delete('/town/' + validTown.slug)
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

        it('should response ok (remove town)', function (done) {
            request
                .delete('/town/' + validTown.slug)
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
                .get('/town/' + validTown.slug)
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

        it('should response ok (get towns after remove existing content)', function (done) {
            request
                .get('/town')
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

        it('should fail adding Town with client token', function (done) {
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

            const error = new exception.ValidationSuperadmin()

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

        it('should fail updating without token', function (done) {
            const error = new exception.ValidationSuperadmin()

            request
                .put('/town/' + validTown.slug)
                .set('Authorization', validToken)
                .send(validTown)
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

        it('should fail deleting town without token', function (done) {
            const error = new exception.ValidationSuperadmin()

            request
                .delete('/town/' + validTown.slug)
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
