const express = require('express');
const errorHandler = require('../utils/errorHandler');
const queryValidation = require('../utils/queryValidation');

class TagRouter {
    constructor(tagService) {
        this.tagService = tagService;
    }

    router() {
        let router = express.Router();
        router.get('/', this.get.bind(this));
        return router;
    }

    get(req, res) {
        let queryArray = queryValidation(req.query, ['q', 'limit', 'offset']);
        return this.tagService.searchTag(queryArray)
            .then(data => res.status(200).json(data))
            .catch(err => errorHandler(res, err));
    }
}

module.exports = TagRouter;