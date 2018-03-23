const express = require('express');
const multer = require('multer');
const upload = multer();
// const cpUpload = upload.array('photos', 6);
const cpUpload = upload.fields([{ name: 'winePhotos', maxCount: 3 }, { name: 'photos', maxCount: 6 }])

class EventRouter {
    constructor(eventService) {
        this.eventService = eventService;
    }

    router() {
        let router = express.Router();
        router.post('/', cpUpload, this.postEvent.bind(this));
        return router;
    }

    postEvent(req, res) {
        return this.eventService.postEvent(req)
        .then((status) => res.status(200).json(status))
        .catch((err) => res.status(404).json(err));
    }
}

module.exports = EventRouter;