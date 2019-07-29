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
let validActivityType
const pagination = {
    page: 1,
    limit: 25
}

describe('FUNCTIONAL API - ACTIVITY TYPE', function(){
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

        it('get activityType empty without token', function (done) {
            request
                .get('/activity-type')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('activityTypes')
                    expect(res.body.data.activityTypes).to.be.an('Array').to.be.empty
                    expect(res.body.data).to.have.property('pagination')
                    expect(res.body.data.pagination).to.be.deep.equal(pagination)
                    done()
                })
        })

        if (process.env.PB_AWS_CONF) {
            it('should response ok (add ActivityType)', function (done) {
                validActivityType = {
                    name: faker.lorem.sentence(),
                    description: faker.lorem.sentence(),
                }

                request
                    .post('/activity-type')
                    .set('Authorization', validToken)
                    .field('name', validActivityType.name)
                    .field('description', validActivityType.description)
                    .attach('image', __dirname + '/../fixtures/duruelo.png')
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res.body.status).to.be.true
                        validActivityType.slug = slugify(validActivityType.name)
                        expect(res.body.data).to.have.property('id')
                        validActivityType.id = res.body.data.id
                        expect(res.body.data).to.have.property('image')
                        validActivityType.image = res.body.data.image
                        expect(res.body.data).to.be.deep.equal(validActivityType)
                        done()
                    })
            })
        }

        it('should response ok (add ActivityType without image)', function (done) {
            validActivityType = {
                name: faker.lorem.sentence(),
                description: faker.lorem.sentence(),
                image: null
            }

            request
                .post('/activity-type')
                .set('Authorization', validToken)
                .field('name', validActivityType.name)
                .field('description', validActivityType.description)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    validActivityType.slug = slugify(validActivityType.name)
                    expect(res.body.data).to.have.property('id')
                    validActivityType.id = res.body.data.id
                    expect(res.body.data).to.be.deep.equal(validActivityType)
                    done()
                })
        })

        it('should fail adding ActivityType without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .post('/activity-type')
                .field('name', validActivityType.name)
                .field('description', validActivityType.description)
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
                .get('/activity-type')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('activityTypes')
                    expect(res.body.data.activityTypes).to.be.an('Array')
                    expect(res.body.data.activityTypes[0]).to.be.deep.equal(validActivityType)
                    expect(res.body.data).to.have.property('pagination')
                    expect(res.body.data.pagination).to.be.deep.equal(pagination)
                    done()
                })
        })

        it('should response ok (content exists)', function (done) {
            request
                .get('/activity-type/' + validActivityType.slug)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validActivityType)
                    done()
                })
        })

        it('should response ko (not exists)', function (done) {
            const error = new exception.EntityNotExists()

            request
                .get('/activity-type/' + validActivityType.slug + '-not-exists')
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

        it('should response ok (add activityType with the same name)', function (done) {
            const error = new exception.EntityAlreadyExists()

            request
                .post('/activity-type')
                .set('Authorization', validToken)
                .send(validActivityType)
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

        it('should response ok (update ActivityType)', function (done) {
            validActivityType.description = faker.lorem.sentence()

            request
                .put('/activity-type/' + validActivityType.slug)
                .set('Authorization', validToken)
                .send(validActivityType)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validActivityType)
                    done()
                })
        })

        it('should fail updating without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .put('/activity-type/' + validActivityType.slug)
                .send(validActivityType)
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

        it('should fail deleting activityType without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .delete('/activity-type/' + validActivityType.slug)
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

        it('should response ok (remove activityType)', function (done) {
            request
                .delete('/activity-type/' + validActivityType.slug)
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
                .get('/activity-type/' + validActivityType.slug)
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

        it('should response ok (get activityTypes after remove existing content)', function (done) {
            request
                .get('/activity-type')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('activityTypes')
                    expect(res.body.data.activityTypes).to.be.an('Array').to.be.empty
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

        it('should fail adding ActivityType with client token', function (done) {
            validActivityType = {
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
                .post('/activity-type')
                .set('Authorization', validToken)
                .field('name', validActivityType.name)
                .field('description', validActivityType.description)
                .field('location', JSON.stringify(validActivityType.location))
                .field('address', validActivityType.address)
                .field('phone', validActivityType.phone)
                .field('email', validActivityType.email)
                .field('web', validActivityType.web)
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
                .put('/activity-type/' + validActivityType.slug)
                .set('Authorization', validToken)
                .send(validActivityType)
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

        it('should fail deleting activityType without token', function (done) {
            const error = new exception.ValidationSuperadmin()

            request
                .delete('/activity-type/' + validActivityType.slug)
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

        it('should fail updating ActivityType if the user is not the owner', function (done) {
            const error = new exception.ValidationSuperadmin()

            request
                .put('/activity-type/' + validActivityType.slug)
                .set('Authorization', validToken)
                .send(validActivityType)
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

        it('should fail deleting ActivityType if the user is not the owner', function (done) {
            const error = new exception.ValidationSuperadmin()

            request
                .delete('/activity-type/' + validActivityType.slug)
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
