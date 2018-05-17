const express = require('express');
const errorHandler = require('../utils/errorHandler');
const queryStringValidator = require('../utils/queryValidation');

class QuestionRouter {
    constructor(questionService) {
        this.questionService = questionService;
    }

    router() {
        let router = express.Router();
        router.post('/', this.postQuestion.bind(this));
        router.post('/:questionId/option', this.createNewOption.bind(this));
        router.get('/allquestion', this.getAllQuestion.bind(this));
        router.get('/:questionId', this.getQuestion.bind(this));
        router.patch('/:questionId', this.updateQuestion.bind(this));
        return router;
    }

    postQuestion(req, res) {
        return this.questionService.postQuestion(req)
            .then((status) => res.status(201).json(status))
            .catch((err) => errorHandler(res, err));
    }

    createNewOption(req, res) {
        return this.questionService.createNewOption(req)
            .then((status) => res.status(201).json(status))
            .catch((err) => errorHandler(res, err));
    }

    updateOption(req, res) {
        return this.questionService.updateOption(req)
            .then((status) => res.status(200).json(status))
            .catch((err) => errorHandler(res, err));
    }

    getQuestion(req, res) {
        let queryArray = queryStringValidator(req.query, ['includeExpired']);
        return this.questionService.getQuestion(req, queryArray)
            .then((question) => res.status(200).json(question))
            .catch((err) => errorHandler(res, err));
    }

    getAllQuestion(req, res) {
        let queryArray = queryStringValidator(req.query, ['includeExpired', 'limit', 'offset']);
        return this.questionService.getAllQuestions(req, queryArray)
            .then((questions) => res.status(200).json(questions))
            .catch((err) => errorHandler(res, err));
    }

    updateQuestion(req, res) {
        return this.questionService.updateQuestion(req)
            .then((status) => res.status(200).json(status))
            .catch((err) => errorHandler(res, err));
    }

}

module.exports = QuestionRouter;