const express = require('express');
const queryValidation = require('../utils/queryValidation');
const errorHandler = require('../utils/errorHandler');

class UploadRouter {

    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    
    router() {
        let router = express.Router();
        router.post('/event', this.eventFileUpload.bind(this));
        router.post('/profile', this.propicFileUpload.bind(this));
        return router;
    }

    eventFileUpload(req, res) {
        return this.uploadService.photoUpload(req, 'event')
            .then(user => res.status(200).json(user))
            .catch(err => errorHandler(res, err));
    }

    propicFileUpload(req, res) {
        return this.uploadService.photoUpload(req, 'profile')
            .then(status => res.status(200).json(status))
            .catch(err => errorHandler(err));
            
        }
        
    deleteFile(req) {
            return this.uploadService.deletePhotos(req)
            .then(status => res.status(200).json(status))
            .catch(err => errorHandler(err));
    }
}
module.exports = UploadRouter;