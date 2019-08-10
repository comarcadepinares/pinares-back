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
let validActivity
let validTown
let validActivityType
const pagination = {
    page: 1,
    limit: 25
}

describe('FUNCTIONAL API - ACTIVITY', function(){
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

        it('get activity empty without token', function (done) {
            request
                .get('/activity')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('activities')
                    expect(res.body.data.activities).to.be.an('Array').to.be.empty
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

        if (process.env.PB_AWS_CONF) {
            it('should response ok (add Activity)', function (done) {
                validActivity = {
                    name: faker.lorem.sentence(),
                    townId: validTown.id,
                    activityTypeId: validActivityType.id,
                    description: faker.lorem.sentence(),
                    location: getPoint(faker.address.latitude(), faker.address.longitude()),
                    address: faker.address.streetAddress(),
                    phone: faker.phone.phoneNumber(),
                    email: faker.internet.email(),
                    web: faker.internet.url(),
                    highlight: false,
                    options: [],
                    images: []
                }

                request
                    .post('/activity')
                    .set('Authorization', validToken)
                    .field('name', validActivity.name)
                    .field('townId', validActivity.townId)
                    .field('activityTypeId', validActivity.activityTypeId)
                    .field('description', validActivity.description)
                    .field('location', JSON.stringify(validActivity.location))
                    .field('address', validActivity.address)
                    .field('phone', validActivity.phone)
                    .field('email', validActivity.email)
                    .field('web', validActivity.web)
                    .attach('image', __dirname + '/../fixtures/duruelo.png')
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res.body.status).to.be.true
                        validActivity.slug = slugify(validActivity.name)
                        expect(res.body.data).to.have.property('id')
                        validActivity.id = res.body.data.id
                        expect(res.body.data).to.have.property('image')
                        validActivity.image = res.body.data.image
                        expect(res.body.data).to.be.deep.equal(validActivity)
                        done()
                    })
            })

            it('should response ok (add image)', function (done) {
                request
                    .post(`/activity/${validActivity.slug}/image`)
                    .set('Authorization', validToken)
                    .attach('image', __dirname + '/../fixtures/duruelo.png')
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res.body.status).to.be.true
                        validActivity.images = res.body.data.images
                        expect(res.body.data).to.be.deep.equal(validActivity)
                        expect(res.body.data.images.length).to.be.deep.equal(1)
                        done()
                    })
            })

            it('should response ok (exists 1 with 1 image)', function (done) {
                request
                    .get('/activity')
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res.body.status).to.be.true
                        expect(res.body.data).to.have.property('activities')
                        expect(res.body.data.activities).to.be.an('Array')
                        expect(res.body.data.activities.length).to.be.equal(1)
                        expect(res.body.data.activities[0]).to.be.deep.equal(validActivity)
                        expect(res.body.data.activities[0].images.length).to.be.equal(1)
                        expect(res.body.data).to.have.property('pagination')
                        expect(res.body.data.pagination).to.be.deep.equal(pagination)
                        done()
                    })
            })

            it('should response ok (remove image)', function (done) {
                request
                    .delete(`/activity/${validActivity.slug}/image`)
                    .set('Authorization', validToken)
                    .send({image: validActivity.images[0]})
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res.body.status).to.be.true
                        validActivity.images = []
                        expect(res.body.data).to.be.deep.equal(validActivity)
                        done()
                    })
            })

            it('should response ok (exists 1 with 0 images)', function (done) {
                request
                    .get('/activity')
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res.body.status).to.be.true
                        expect(res.body.data).to.have.property('activities')
                        expect(res.body.data.activities).to.be.an('Array')
                        expect(res.body.data.activities[0]).to.be.deep.equal(validActivity)
                        expect(res.body.data).to.have.property('pagination')
                        expect(res.body.data.pagination).to.be.deep.equal(pagination)
                        done()
                    })
            })
        }

        it('should response ok (add Activity without image)', function (done) {
            validActivity = {
                name: faker.lorem.sentence(),
                townId: validTown.id,
                activityTypeId: validActivityType.id,
                description: faker.lorem.sentence(),
                location: getPoint(faker.address.latitude(), faker.address.longitude()),
                address: faker.address.streetAddress(),
                phone: faker.phone.phoneNumber(),
                email: faker.internet.email(),
                web: faker.internet.url(),
                image: null,
                highlight: false,
                options: [],
                images: []
            }

            request
                .post('/activity')
                .set('Authorization', validToken)
                .send(validActivity)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    validActivity.slug = slugify(validActivity.name)
                    expect(res.body.data).to.have.property('id')
                    validActivity.id = res.body.data.id
                    expect(res.body.data).to.be.deep.equal(validActivity)
                    done()
                })
        })

        it('should fail adding Activity without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .post('/activity')
                .field('name', validActivity.name)
                .field('description', validActivity.description)
                .field('location', JSON.stringify(validActivity.location))
                .field('address', validActivity.address)
                .field('phone', validActivity.phone)
                .field('email', validActivity.email)
                .field('web', validActivity.web)
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
                .get('/activity')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('activities')
                    expect(res.body.data.activities).to.be.an('Array')
                    expect(res.body.data.activities[0]).to.be.deep.equal(validActivity)
                    expect(res.body.data).to.have.property('pagination')
                    expect(res.body.data.pagination).to.be.deep.equal(pagination)
                    done()
                })
        })

        it('should response ok (content exists)', function (done) {
            request
                .get('/activity/' + validActivity.slug)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validActivity)
                    done()
                })
        })

        it('should response ko (not exists)', function (done) {
            const error = new exception.EntityNotExists()

            request
                .get('/activity/' + validActivity.slug + '-not-exists')
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

        it('should response ok (add activity with the same name)', function (done) {
            validActivity.townId = validTown.id

            const error = new exception.EntityAlreadyExists()

            request
                .post('/activity')
                .set('Authorization', validToken)
                .send(validActivity)
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

        it('should response ok (update Activity)', function (done) {
            validActivity.townId = validTown.id

            validActivity.name = faker.lorem.sentence(),
            validActivity.description = faker.lorem.sentence()
            validActivity.location = getPoint(faker.address.latitude(), faker.address.longitude())
            validActivity.address = faker.address.streetAddress()
            validActivity.phone = faker.phone.phoneNumber()
            validActivity.email = faker.internet.email()
            validActivity.web = faker.internet.url()

            request
                .put('/activity/' + validActivity.slug)
                .set('Authorization', validToken)
                .send(validActivity)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validActivity)
                    done()
                })
        })

        it('should response ok (update 2 fields)', function (done) {
            validActivity.townId = validTown.id

            validActivity.phone = faker.phone.phoneNumber()
            validActivity.email = null

            request
                .put('/activity/' + validActivity.slug)
                .set('Authorization', validToken)
                .send(validActivity)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validActivity)
                    done()
                })
        })

        it('should fail updating without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .put('/activity/' + validActivity.slug)
                .send(validActivity)
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

        it('should fail deleting activity without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .delete('/activity/' + validActivity.slug)
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

        it('should response ok (remove activity)', function (done) {
            request
                .delete('/activity/' + validActivity.slug)
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
                .get('/activity/' + validActivity.slug)
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

        it('should response ok (get activities after remove existing content)', function (done) {
            request
                .get('/activity')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('activities')
                    expect(res.body.data.activities).to.be.an('Array').to.be.empty
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

        it('should work adding Activity', function (done) {
            validActivity.townId = validTown.id
            validActivity.name = faker.lorem.sentence(),

            request
                .post('/activity')
                .set('Authorization', validToken)
                .send(validActivity)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    validActivity.slug = slugify(validActivity.name)
                    expect(res.body.data).to.have.property('id')
                    validActivity.id = res.body.data.id
                    expect(res.body.data).to.have.property('image')
                    validActivity.image = res.body.data.image
                    expect(res.body.data).to.be.deep.equal(validActivity)
                    done()
                })
        })

        it('should work updating activity', function (done) {
            validActivity.townId = validTown.id

            validActivity.description = faker.lorem.sentence()
            validActivity.location = getPoint(faker.address.latitude(), faker.address.longitude())
            validActivity.address = faker.address.streetAddress()
            validActivity.phone = faker.phone.phoneNumber()
            validActivity.email = faker.internet.email()
            validActivity.web = faker.internet.url()

            request
                .put('/activity/' + validActivity.slug)
                .set('Authorization', validToken)
                .send(validActivity)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validActivity)
                    done()
                })
        })

        it('should work deleting activity', function (done) {
            request
                .delete('/activity/' + validActivity.slug)
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

        it('should fail updating Activity if the user is not the owner', function (done) {
            let error = new exception.EntityNotExists()

            request
                .put('/activity/' + validActivity.slug)
                .set('Authorization', validToken)
                .send(validActivity)
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

        it('should fail deleting Activity if the user is not the owner', function (done) {
            let error = new exception.EntityNotExists()

            request
                .delete('/activity/' + validActivity.slug)
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
