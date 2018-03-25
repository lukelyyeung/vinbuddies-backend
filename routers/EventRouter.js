const express = require('express');
const multer = require('multer');
const upload = multer();
const EVENT_STATUS = require('../constant/eventConstant');
const cpUpload = upload.fields([{ name: 'winePhotos', maxCount: 3 }, { name: 'photos', maxCount: 6 }])

class EventRouter {
    constructor(eventService) {
        this.eventService = eventService;
    }

    router() {
        let router = express.Router();
        router.post('/', cpUpload, this.postEvent.bind(this));
        router.delete('/:eventId', this.deleteEvent.bind(this));
        router.get('/:eventId', this.getEvent.bind(this));
        router.patch('/:eventId', cpUpload, this.updateEvent.bind(this));
        return router;
    }

    postEvent(req, res) {
        return this.eventService.postEvent(req)
            .then((status) => res.status(200).json(status))
            .catch((err) => this.errorHandle(res, err));
    }

    deleteEvent(req, res) {
        return this.eventService.deleteEvent(req)
            .then((status) => res.status(200).json(status))
            .catch((err) => this.errorHandle(res, err));
    }

    updateEvent(req, res) {
        return this.eventService.updateEvent(req.params.eventId, req)
            .then((status) => res.status(200).json(status))
            .catch((err) => this.errorHandle(res, err));
    }

    getEvent(req, res) {
        return this.eventService.getEvent(req.params.eventId)
            .then((status) => res.status(200).json(status))
            .catch((err) => this.errorHandle(res, err));
    }

    errorHandle(res, err) {
        switch (err.message) {
            case EVENT_STATUS.NOT_FOUND: {
                res.status(404).json({ error: err.message });
                break;
            }
            case EVENT_STATUS.NOT_AUTHORIZED: {
                res.status(401).json({ error: err.message });
                break;
            }
            case EVENT_STATUS.UPLOAD_FAIL:
            case EVENT_STATUS.SERVER_ERROR: {
                res.status(500).json({ error: err.message });
                break;
            }
            default: {
                console.log(err);
                res.status(520).json({ error: EVENT_STATUS.UNKNOWN_ERROR });
                break;
            }
        }
    }
}

module.exports = EventRouter;