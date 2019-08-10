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
let validRestaurant
let validTown
const pagination = {
    page: 1,
    limit: 25
}

describe('FUNCTIONAL API - RESTAURANT', function(){
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

        it('get restaurant empty without token', function (done) {
            request
                .get('/restaurant')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('restaurants')
                    expect(res.body.data.restaurants).to.be.an('Array').to.be.empty
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
            it('should response ok (add Restaurant)', function (done) {
                validRestaurant = {
                    name: faker.lorem.sentence(),
                    townId: validTown.id,
                    description: faker.lorem.sentence(),
                    location: getPoint(faker.address.latitude(), faker.address.longitude()),
                    address: faker.address.streetAddress(),
                    phone: faker.phone.phoneNumber(),
                    email: faker.internet.email(),
                    web: faker.internet.url(),
                    highlight: false,
                    images: []
                }

                request
                    .post('/restaurant')
                    .set('Authorization', validToken)
                    .field('name', validRestaurant.name)
                    .field('townId', validRestaurant.townId)
                    .field('description', validRestaurant.description)
                    .field('location', JSON.stringify(validRestaurant.location))
                    .field('address', validRestaurant.address)
                    .field('phone', validRestaurant.phone)
                    .field('email', validRestaurant.email)
                    .field('web', validRestaurant.web)
                    .attach('image', __dirname + '/../fixtures/duruelo.png')
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res.body.status).to.be.true
                        validRestaurant.slug = slugify(validRestaurant.name)
                        expect(res.body.data).to.have.property('id')
                        validRestaurant.id = res.body.data.id
                        expect(res.body.data).to.have.property('image')
                        validRestaurant.image = res.body.data.image
                        expect(res.body.data).to.be.deep.equal(validRestaurant)
                        done()
                    })
            })

            it('should response ok (add image)', function (done) {
                request
                    .post(`/restaurant/${validHotel.slug}/image`)
                    .set('Authorization', validToken)
                    .attach('image', __dirname + '/../fixtures/duruelo.png')
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res.body.status).to.be.true
                        validHotel.images = res.body.data.images
                        expect(res.body.data).to.be.deep.equal(validRestaurant)
                        expect(res.body.data.images.length).to.be.deep.equal(1)
                        done()
                    })
            })

            it('should response ok (exists 1 with 1 image)', function (done) {
                request
                    .get('/restaurant')
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res.body.status).to.be.true
                        expect(res.body.data).to.have.property('hotels')
                        expect(res.body.data.hotels).to.be.an('Array')
                        expect(res.body.data.hotels.length).to.be.equal(1)
                        expect(res.body.data.hotels[0]).to.be.deep.equal(validHotel)
                        expect(res.body.data.hotels[0].images.length).to.be.equal(1)
                        expect(res.body.data).to.have.property('pagination')
                        expect(res.body.data.pagination).to.be.deep.equal(pagination)
                        done()
                    })
            })

            it('should response ok (remove image)', function (done) {
                request
                    .delete(`/restaurant/${validHotel.slug}/image`)
                    .set('Authorization', validToken)
                    .send({image: validHotel.images[0]})
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res.body.status).to.be.true
                        validHotel.images = []
                        expect(res.body.data).to.be.deep.equal(validHotel)
                        done()
                    })
            })

            it('should response ok (exists 1 with 0 images)', function (done) {
                request
                    .get('/restaurant')
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
        }

        it('should response ok (add Restaurant without image)', function (done) {
            validRestaurant = {
                name: faker.lorem.sentence(),
                townId: validTown.id,
                description: faker.lorem.sentence(),
                location: getPoint(faker.address.latitude(), faker.address.longitude()),
                address: faker.address.streetAddress(),
                phone: faker.phone.phoneNumber(),
                email: faker.internet.email(),
                web: faker.internet.url(),
                image: null,
                highlight: false,
                images: []
            }

            request
                .post('/restaurant')
                .set('Authorization', validToken)
                .send(validRestaurant)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    validRestaurant.slug = slugify(validRestaurant.name)
                    expect(res.body.data).to.have.property('id')
                    validRestaurant.id = res.body.data.id
                    expect(res.body.data).to.be.deep.equal(validRestaurant)
                    done()
                })
        })

        it('should fail adding Restaurant without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .post('/restaurant')
                .field('name', validRestaurant.name)
                .field('description', validRestaurant.description)
                .field('location', JSON.stringify(validRestaurant.location))
                .field('address', validRestaurant.address)
                .field('phone', validRestaurant.phone)
                .field('email', validRestaurant.email)
                .field('web', validRestaurant.web)
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
                .get('/restaurant')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('restaurants')
                    expect(res.body.data.restaurants).to.be.an('Array')
                    expect(res.body.data.restaurants[0]).to.be.deep.equal(validRestaurant)
                    expect(res.body.data).to.have.property('pagination')
                    expect(res.body.data.pagination).to.be.deep.equal(pagination)
                    done()
                })
        })

        it('should response ok (content exists)', function (done) {
            request
                .get('/restaurant/' + validRestaurant.slug)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validRestaurant)
                    done()
                })
        })

        it('should response ko (not exists)', function (done) {
            const error = new exception.EntityNotExists()

            request
                .get('/restaurant/' + validRestaurant.slug + '-not-exists')
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

        it('should response ok (add restaurant with the same name)', function (done) {
            validRestaurant.townId = validTown.id

            const error = new exception.EntityAlreadyExists()

            request
                .post('/restaurant')
                .set('Authorization', validToken)
                .send(validRestaurant)
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

        it('should response ok (update Restaurant)', function (done) {
            validRestaurant.townId = validTown.id

            validRestaurant.name = faker.lorem.sentence(),
            validRestaurant.description = faker.lorem.sentence()
            validRestaurant.location = getPoint(faker.address.latitude(), faker.address.longitude())
            validRestaurant.address = faker.address.streetAddress()
            validRestaurant.phone = faker.phone.phoneNumber()
            validRestaurant.email = faker.internet.email()
            validRestaurant.web = faker.internet.url()

            request
                .put('/restaurant/' + validRestaurant.slug)
                .set('Authorization', validToken)
                .send(validRestaurant)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validRestaurant)
                    done()
                })
        })

        it('should response ok (update 2 fields)', function (done) {
            validRestaurant.townId = validTown.id

            validRestaurant.phone = faker.phone.phoneNumber()
            validRestaurant.email = null

            request
                .put('/restaurant/' + validRestaurant.slug)
                .set('Authorization', validToken)
                .send(validRestaurant)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validRestaurant)
                    done()
                })
        })

        it('should fail updating without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .put('/restaurant/' + validRestaurant.slug)
                .send(validRestaurant)
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

        it('should fail deleting restaurant without token', function (done) {
            const error = new exception.ValidationPublicKeyFailed()

            request
                .delete('/restaurant/' + validRestaurant.slug)
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

        it('should response ok (remove restaurant)', function (done) {
            request
                .delete('/restaurant/' + validRestaurant.slug)
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
                .get('/restaurant/' + validRestaurant.slug)
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

        it('should response ok (get restaurants after remove existing content)', function (done) {
            request
                .get('/restaurant')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.have.property('restaurants')
                    expect(res.body.data.restaurants).to.be.an('Array').to.be.empty
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

        it('should work adding Restaurant', function (done) {
            validRestaurant.townId = validTown.id
            validRestaurant.name = faker.lorem.sentence(),

            request
                .post('/restaurant')
                .set('Authorization', validToken)
                .send(validRestaurant)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    validRestaurant.slug = slugify(validRestaurant.name)
                    expect(res.body.data).to.have.property('id')
                    validRestaurant.id = res.body.data.id
                    expect(res.body.data).to.have.property('image')
                    validRestaurant.image = res.body.data.image
                    expect(res.body.data).to.be.deep.equal(validRestaurant)
                    done()
                })
        })

        it('should work updating restaurant', function (done) {
            validRestaurant.townId = validTown.id

            validRestaurant.description = faker.lorem.sentence()
            validRestaurant.location = getPoint(faker.address.latitude(), faker.address.longitude())
            validRestaurant.address = faker.address.streetAddress()
            validRestaurant.phone = faker.phone.phoneNumber()
            validRestaurant.email = faker.internet.email()
            validRestaurant.web = faker.internet.url()

            request
                .put('/restaurant/' + validRestaurant.slug)
                .set('Authorization', validToken)
                .send(validRestaurant)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null
                    expect(res.body.status).to.be.true
                    expect(res.body.data).to.be.deep.equal(validRestaurant)
                    done()
                })
        })

        it('should work deleting restaurant', function (done) {
            request
                .delete('/restaurant/' + validRestaurant.slug)
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

        it('should fail updating Restaurant if the user is not the owner', function (done) {
            let error = new exception.EntityNotExists()

            request
                .put('/restaurant/' + validRestaurant.slug)
                .set('Authorization', validToken)
                .send(validRestaurant)
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

        it('should fail deleting Restaurant if the user is not the owner', function (done) {
            let error = new exception.EntityNotExists()

            request
                .delete('/restaurant/' + validRestaurant.slug)
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
