const express = require('express');
const queryStringValidator = require('../utils/queryValidation');
const errorHandler = require('../utils/errorHandler');
const properties =  ['role', 'limit', 'offset', 'title', 'date', 'tag', 'deleted', 'orderby'];

class EventJournalRouter {
    constructor(eventJorunalService) {
        this.eventJorunalService = eventJorunalService;
    }

    router() {
        let router = express.Router();
        router.get('/', this.getJounral.bind(this));
        return router;
    }

    getJounral(req, res) {
        let queryArray = queryStringValidator(req.query, properties);
            return this.eventJorunalService.getJournal(req, queryArray)
            .then(journal => res.json(journal))
            .catch(err => errorHandler(res, err));
    }
}

module.exports = EventJournalRouter;