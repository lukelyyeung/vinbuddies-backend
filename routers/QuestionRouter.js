const express = require('express');
const QUESTION_STATUS = require('../constant/questionConstant');

class QuestionRouter {
    constructor(questionService) {
        this.questionService = questionService;
    }

    router() {
        let router = express.Router();
        router.post('/', this.createQuestion.bind(this));
        router.post('/:questionId/option', this.insertOption.bind(this));
        router.get('/allquestion', this.getAllQuestion.bind(this));
        router.get('/:questionId', this.getQuestion.bind(this));
        router.patch('/:questionId', this.updateQuestion.bind(this));
        return router;
    }

    createQuestion(req, res) {
        return this.questionService.createQuestion(req.body)
            .then((status) => res.status(201).json(status))
            .catch((err) => res.json(this.errorHandle(res, err)));
    }

    insertOption(req, res) {
        return this.questionService.insertOption(req.params.questionId, req.body)
            .then((status) => res.status(201).json(status))
            .catch((err) => res.json(this.errorHandle(res, err)));
    }

    updateOption(req, res) {
        return this.questionService.updateOption(req.body)
            .then((status) => res.status(200).json(status))
            .catch((err) => res.json(this.errorHandle(res, err)));
    }

    getQuestion(req, res) {
        return this.questionService.getQuestion(req.params.questionId)
            .then((question) => res.status(200).json(question))
            .catch((err) => res.json(this.errorHandle(res, err)));
    }

    getAllQuestion(req, res) {
        return this.questionService.getAllQuestions()
            .then((questions) => res.status(200).json(questions))
            .catch((err) => res.json(this.errorHandle(res, err)));
    }

    updateQuestion(req, res) {
        return this.questionService.updateQuestion(req.params.questionId, req.body)
            .then((status) => res.status(200).json(status))
            .catch((err) => res.json(this.errorHandle(res, err)));
    }

    errorHandle(res, err) {
        switch (err.message) {
            case QUESTION_STATUS.READ_FAIL_NO_QUESTION: {
                res.status(404).json({ error: err.message });
                break;
            }
            case QUESTION_STATUS.POST_FAIL_INVALID_INPUT: {
                    res.status(412).json({ error: err.message });
                    break;
                }
            case QUESTION_STATUS.SERVER_ERROR: {
                res.status(500).json({ error: err.message });
                break;
            }
            default:
            console.log(err);
            res.status(520).json({ error: QUESTION_STATUS.UNKNOWN_ERROR });
        };
    }
}

module.exports = QuestionRouter;