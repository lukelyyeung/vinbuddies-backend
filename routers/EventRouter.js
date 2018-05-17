const express = require('express');
const multer = require('multer');
const upload = multer();
const errorHandler = require('../utils/errorHandler');

class EventRouter {
    constructor(eventService) {
        this.eventService = eventService;
    }

    router() {
        let router = express.Router();
        router.post('/', this.postEvent.bind(this));
        router.delete('/:eventId', this.deleteEvent.bind(this));
        router.get('/:eventId', this.getEvent.bind(this));
        router.patch('/:eventId', this.updateEvent.bind(this));
        return router;
    }

    postEvent(req, res) {
        return this.eventService.postEvent(req)
            .then((status) => res.status(200).json(status))
            .catch((err) => errorHandler(res, err));
    }

    deleteEvent(req, res) {
        return this.eventService.deleteEvent(req.params.eventId, req)
            .then((status) => res.status(200).json(status))
            .catch((err) => errorHandler(res, err));
    }

    updateEvent(req, res) {
        return this.eventService.updateEvent(req.params.eventId, req)
            .then((status) => res.status(200).json(status))
            .catch((err) => errorHandler(res, err));
    }

    getEvent(req, res) {
        return this.eventService.getEvent(req.params.eventId, req)
            .then((status) => res.status(200).json(status))
            .catch((err) => errorHandler(res, err));
    }
}

module.exports = EventRouter;