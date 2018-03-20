const express = require('express');
const QUESTION_HISTORY_STATUS = require('../constant/questionHistoryConstant')

class QuestionHistoryRouter {
    constructor(questionHistoryService) {
        this.questionHistoryService = questionHistoryService;
    }

    router() {
        let router = express.Router();
        router.get('/:userId', this.getHistory.bind(this));
        router.post('/:userId', this.postHistory.bind(this));
        router.delete('/:userId', this.delHistory.bind(this));
        return router;
    }

    getHistory(req, res) {
        return this.questionHistoryService.getHistory(req.params.userId)
            .then(userHistory => res.json(userHistory))
            .catch(err => res.json(this.errorHandle(err)));
    }

    postHistory(req, res) {
        return this.questionHistoryService.postHistory(req.params.userId, req.body)
            .then(status => res.json(status))
            .catch(err => res.json(this.errorHandle(err)));
    }

    delHistory(req, res) {
        return this.questionHistoryService.delHistory(req.params.userId)
            .then(status => res.json(status))
            .catch(err => res.json(this.errorHandle(err)));
    }

    errorHandle(err) {
        switch (err.message) {
            case QUESTION_HISTORY_STATUS.POST_HISTORY_FAIL:
            case QUESTION_HISTORY_STATUS.GET_HISTORY_FAIL:
            case QUESTION_HISTORY_STATUS.DELETE_HISTORY_FAIL:
            case QUESTION_HISTORY_STATUS.SERVER_ERROR: {
                return { status: err.message };
                break;
            };
            default: {
                console.log(err);
                throw new Error('QUESTION_HISTORY_UNKNOWN_ERROR');
            };
        }
    }
}

module.exports = QuestionHistoryRouter;