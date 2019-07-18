'use strict'

const fs = require('fs')
const Promise = require('bluebird')
const sharp = require('sharp')
const S3 = require('./s3')
const parameters = requireRoot('../parameters')
const debug = require('debug')('app:services:processMediaUpload')

const s3 = new S3(parameters.aws)
const IMAGE_VALID_MIMETYPES = ['image/jpeg', 'image/png']

module.exports = {
    async preprocessImage (image) {
        if (validateImage(image)) {
            addExtension(image)
            return image
        } else {
            fs.unlinkSync(image.path)
            return false
        }
    },

    async preprocessImages (images) {
        return Promise.map(images, this.preprocessImage).filter(image => !!image)
    },

    async images (images, folder) {
        if (images && images.length) {
            // upload all images to S3
            const imagesPaths = images.map(image => image.path)
            debug('x',imagesPaths)
            const s3Images = await s3.uploadToS3(imagesPaths, folder)

            debug('y', s3Images)

            // remove images
            images.forEach(image => {
                fs.unlinkSync(image.path)
            })

            return s3Images.map(s3Image => s3Image.Location)
        }

        throw new Error('Error saving images')
    }
}

function validateImage (image) {
    if (IMAGE_VALID_MIMETYPES.indexOf(image.mimetype) !== -1) {
        return true
    } else {
        return false
    }
}

function addExtension (image) {
    let newImagePath
    if (image.mimetype === 'image/jpeg') {
        newImagePath = image.path + '.jpg'
        image.filename += '.jpg'
    } else {
        newImagePath = image.path + '.png'
        image.filename += '.png'
    }

    fs.renameSync(image.path, newImagePath)
    image.path = newImagePath

    return image
}

function addS3DataToImages (s3Images, images) {
    let imagesWithS3 = []

    for (let i in s3Images) {
        images[i].s3 = s3Images[i].key
        images[i].url = s3Images[i].Location
        imagesWithS3.push(images[i])
    }

    return imagesWithS3
}
