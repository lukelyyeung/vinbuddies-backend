const express = require('express');
const QUESTION_STATUS = require('../constant/questionConstant');

class QuestionRouter{
    constructor(questionService) {
        this.questionService = questionService;
    }

    router() {
        let router = express.Router();
        router.post('/', this.createQuestion.bind(this));
        router.get('/allquestion', this.getAllQuestion.bind(this));
        router.get('/:questionId', this.getQuestion.bind(this));
        router.patch('/:questionId', this.updateQuestion.bind(this));
        return router;
    }

    createQuestion(req, res) {
        return this.questionService.createQuestion(req.body)
            .then((status) => res.json({ status: status }))
            .catch((err) => this.errorHandle(err));
    }

    getQuestion(req, res) {
        return this.questionService.createQuestion(req.params.questionId)
            .then((question) => res.json(question))
            .catch((err) => this.errorHandle(err));
    }

    getAllQuestion(req, res) {
        return this.questionService.getAllQuestion()
            .then((questions) => res.json(questions))
            .catch((err) => this.errorHandle(err));
    }

    updateQuestion(req, res) {
        return this.questionService.updateQuestion(req.params.questionId, req.body)
            .then((status) => res.json({ status: status }))
            .catch((err) => this.errorHandle(err));

    }

    errorHandle(err) {
        switch(err.message) {
            case QUESTION_STATUS.READ_OPTION_FAIL_NO_OPTION:
            case QUESTION_STATUS.READ_QUESTION_FAIL_NO_QUESTION:
            case QUESTION_STATUS.SERVER_ERROR: {
                return { error: err.message };
                break;
            }
            default: 
                console.log(err);
                return { error: 'UNKNOWN_QUESTION_ERROR' };
        };
     }
}

module.exports = QuestionRouter;