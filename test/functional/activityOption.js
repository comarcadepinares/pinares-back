'use strict';

const expect = require('chai').expect
const request = require('supertest').agent(testApp)
const faker = require('faker')
const { slugify } = requireRoot('services/utils')
const { changeUserRole, getPoint, getLine } = require('../helper')
const ActivityOption = requireRoot('appManager').models.ActivityOption
const exception = requireRoot('services/customExceptions')
const debug = require('debug')('app:test:functional:index')

let validUser
let validToken
let validTown
let validActivityType
let validActivity
let validActivityOption
const pagination = {
    page: 1,
    limit: 25
}

describe('FUNCTIONAL API - ACTIVITY OPTION', function(){
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
                .get(`/activity`)
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

        it('should response ok (add ActivityType)', function (done) {
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
                image: null
            }

            request
                .post(`/activity`)
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

        it('should response ok (add Activity Option)', function (done) {
            validActivityOption = {
                schedule: {
                    monday: [{start: '00:00', end: '00:00'}],
                    tuesday: [{start: '00:00', end: '00:00'}],
                    wednesday: [{start: '00:00', end: '00:00'}],
                    thursday: [{start: '00:00', end: '00:00'}],
                    friday: [{start: '00:00', end: '00:00'}],
                    saturday: [{start: '00:00', end: '00:00'}],
                    sunday: [{start: '00:00', end: '00:00'}]
                },
                price: parseFloat(faker.finance.amount()),
                priceType: 1,
                location: getPoint(faker.address.latitude(), faker.address.longitude()),
                journey: getLine(
                    faker.address.latitude(), faker.address.longitude(),
                    faker.address.latitude(), faker.address.longitude(),
                    faker.address.latitude(), faker.address.longitude()
                ),
                duration: faker.random.number(),
                description: faker.lorem.sentence(),
                recomendations: faker.lorem.sentence(),
                people: [ActivityOption.PEOPLE_TYPES.CHILDREN, ActivityOption.PEOPLE_TYPES.OLD],
                minPax: faker.random.number(),
                maxPax: faker.random.number(),
                activityId: validActivity.id,
                townId: validTown.id
            }

            request
                .post(`/activity/${validActivity.slug}/option`)
                .set('Authorization', validToken)
                .send(validActivityOption)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('id')
                    validActivityOption.id = res.body.data.id
                    delete validActivityOption.activityId
                    delete validActivityOption.townId
                    expect(res.body.data).to.be.deep.equal(validActivityOption)
                    done()
                })
        })

        it('should fail adding Activity option without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .post(`/activity/${validActivity.slug}/option`)
                .send(validActivityOption)
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
                .get(`/activity/${validActivity.slug}/option`)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('activityOptions')
                    expect(res.body.data.activityOptions).to.be.an('Array')
                    expect(res.body.data.activityOptions[0]).to.be.deep.equal(validActivityOption)
                    expect(res.body.data).to.have.property('pagination')
                    expect(res.body.data.pagination).to.be.deep.equal(pagination)
                    done()
                })
        })

        it('should response ok (exists)', function (done) {
            request
                .get(`/activity/${validActivity.slug}/option/${validActivityOption.id}`)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validActivityOption)
                    done()
                })
        })

        it('should response ko (not exists)', function (done) {
            const error = new exception.EntityNotExists()

            request
                .get(`/activity/${validActivity.slug}/option/${validActivityOption.id}000000`)
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
            validActivityOption.townId = validTown.id
            validActivityOption.activityId = validActivity.id

            validActivityOption.schedule = {
                saturday: [{start: '00:00', end: '00:00'}],
                sunday: [{start: '00:00', end: '00:00'}]
            }
            validActivityOption.description = faker.lorem.sentence()

            request
                .put(`/activity/${validActivity.slug}/option/${validActivityOption.id}`)
                .set('Authorization', validToken)
                .send(validActivityOption)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    delete validActivityOption.activityId
                    delete validActivityOption.townId
                    expect(res.body.data).to.be.deep.equal(validActivityOption)
                    done()
                })
        })

        it('should fail updating without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .put(`/activity/${validActivity.slug}/option/${validActivityOption.id}`)
                .send(validActivityOption)
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
                .delete(`/activity/${validActivity.slug}/option/${validActivityOption.id}`)
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
                .delete(`/activity/${validActivity.slug}/option/${validActivityOption.id}`)
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
                .get(`/activity/${validActivity.slug}/option/${validActivityOption.id}`)
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

        it('should response ok (get activityOptions after remove existing content)', function (done) {
            request
                .get(`/activity/${validActivity.slug}/option`)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('activityOptions')
                    expect(res.body.data.activityOptions).to.be.an('Array').to.be.empty
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
            validActivityOption.townId = validTown.id
            validActivityOption.activityId = validActivity.id
            validActivityOption.description = faker.lorem.sentence()

            request
                .post(`/activity/${validActivity.slug}/option`)
                .set('Authorization', validToken)
                .send(validActivityOption)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('id')
                    validActivityOption.id = res.body.data.id
                    delete validActivityOption.activityId
                    delete validActivityOption.townId
                    expect(res.body.data).to.be.deep.equal(validActivityOption)
                    done()
                })
        })

        it('should work updating activity', function (done) {
            validActivityOption.townId = validTown.id
            validActivityOption.activityId = validActivity.id
            validActivityOption.description = faker.lorem.sentence()

            request
                .put(`/activity/${validActivity.slug}/option/${validActivityOption.id}`)
                .set('Authorization', validToken)
                .send(validActivityOption)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    delete validActivityOption.activityId
                    delete validActivityOption.townId
                    expect(res.body.data).to.be.deep.equal(validActivityOption)
                    done()
                })
        })

        it('should work deleting activity', function (done) {
            request
                .delete(`/activity/${validActivity.slug}/option/${validActivityOption.id}`)
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
                .put(`/activity/${validActivity.slug}/option/${validActivityOption.id}`)
                .set('Authorization', validToken)
                .send(validActivityOption)
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
                .delete(`/activity/${validActivity.slug}/option/${validActivityOption.id}`)
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
