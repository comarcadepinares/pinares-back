'use strict'

const AWS = require('aws-sdk')
const fs = require('fs')
const debug = require('debug')('app:services:s3')

const VALID_FORMATS = ['jpg', 'jpeg', 'png']

module.exports = class S3 {
    constructor (AWSParameters) {
        this.s3 = new AWS.S3({
            accessKeyId: AWSParameters.accessKeyId,
            secretAccessKey: AWSParameters.secretAccessKey,
            region: AWSParameters.region,
            params: {
                Bucket: AWSParameters.bucket
            }
        })

        this.ACL = AWSParameters.ACL
    }

    /**
     * Upload image or images array to S3 bucket into specified folder
     *
     * @param {Array.<string>|string} imagePaths
     * @param {string} folder a folder name inside your AWS S3 bucket (it will be created if not exists)
     */
    async uploadToS3 (imagePaths, folder) {
        if (Array.isArray(imagePaths)) {
            return this.uploadMultiple(imagePaths, folder)
        } else {
            return this.upload(imagePaths, folder)
        }
    }

    /**
     * Upload file to S3 bucket into specified folder
     *
     * @param {string} filePath
     * @param {string} folder
     */
    async upload (filePath, folder) {
        const s3FilePath = this.getS3FullPath(filePath, folder)

        if (!await this.exists(s3FilePath)) {
            return new Promise((resolve, reject) => {
                const fileStream = fs.createReadStream(filePath)

                const params = {
                    Key: s3FilePath,
                    Body: fileStream
                }

                if (this.ACL) {
                    params.ACL = this.ACL
                }

                const opts = {
                    queueSize: 10, // upload parts in parallel
                    partSize: 1024 * 1024 * 10 // 10Mb
                }

                this.s3.upload(params, opts)
                    .on('httpUploadProgress', function (evt) {
                        debug('upload-part', evt.loaded, '/', evt.total)
                    })
                    .send(function (err, data) {
                        if (err) {
                            debug('upload-error', err)
                            reject(err)
                        }

                        debug('upload-finish', s3FilePath)
                        resolve(data)
                    })
            })
        } else {
            debug('file-already-exists')
            return false
        }
    }

    /**
     * Upload multiple files in parallel to S3 bucket into specified folder
     *
     * @param {Array.<strings>} filePaths
     * @param {string} folder
     * @returns {Promise.<Array>} of S3 files in the same input order
     */
    uploadMultiple (filePaths, folder) {
        return Promise.all(
            filePaths.map(filePath => this.upload(filePath, folder))
        )
    }

    /**
     * Check if file exists in S3
     *
     * @param {string} s3FilePath
     * @return {Promise.<boolean>}}
     */
    exists (s3FilePath) {
        return new Promise((resolve, reject) => {
            this.s3.headObject({ Key: s3FilePath }, function (err, data) {
                if (!err) { resolve(true) }

                resolve(false)
            })
        })
    }

    /**
     * Creates the S3 path and checks the file format
     *
     * @param {string} filePath
     * @param {string} folder
     */
    getS3FullPath (filePath, folder = 'dev/') {
        const fileName = new Date().getTime() + '-' + filePath.split('/').pop()
        const extension = fileName.split('.').pop().toLowerCase()

        if (VALID_FORMATS.indexOf(extension) !== -1) {
            return folder + fileName
        } else {
            throw new Error('Invalid file format')
        }
    }
}
