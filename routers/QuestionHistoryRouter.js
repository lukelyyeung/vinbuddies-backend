const express = require('express');
const errorHandler = require('../utils/errorHandler');
const queryStringValidation = require('../utils/queryValidation');

class QuestionHistoryRouter {
    constructor(questionHistoryService) {
        this.questionHistoryService = questionHistoryService;
    }

    router() {
        let router = express.Router();
        router.get('/meta', this.getmeta.bind(this));
        router.get('/:userId', this.getHistory.bind(this));
        router.post('/:userId', this.postHistory.bind(this));
        router.delete('/:userId', this.delHistory.bind(this));
        return router;
    }

    getHistory(req, res) {
        let queryArray = queryStringValidation(req.query, ['includeExpired', 'limit', 'offset']);
        return this.questionHistoryService.getHistory(req, queryArray)
            .then(userHistory => res.status(200).json(userHistory))
            .catch(err => errorHandler(res, err));
    }

    getmeta(req, res) {
        return this.questionHistoryService.getOptionMeta([47,48])
            .then(userHistory => res.status(200).json(userHistory))
            .catch(err => errorHandler(res, err));
    }

    postHistory(req, res) {
        return this.questionHistoryService.postHistory(req)
            .then(status => res.status(200).json(status))
            .catch(err => {
                errorHandler(res, err)
            });
    }

    delHistory(req, res) {
        return this.questionHistoryService.delHistory(req)
            .then(status => res.status(200).json(status))
            .catch(err => errorHandler(res, err));
    }

}

module.exports = QuestionHistoryRouter;