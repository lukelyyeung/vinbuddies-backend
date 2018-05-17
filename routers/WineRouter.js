const express = require('express');
const errorHandler = require('../utils/errorHandler');
const queryValidation = require('../utils/queryValidation');

class WineRouter {
    constructor(wineService) {
        this.wineService = wineService;
    }

    router() {
        let router = express.Router();
        router.get('/', this.get.bind(this));
        router.get('/meta', this.getByMeta.bind(this));
        return router;
    }

    get(req, res) {
        let queryArray = queryValidation(req.query, ['id', 'name', 'limit', 'offset']);
        return this.wineService.searchWine(queryArray)
            .then(data => res.status(200).json(data))
            .catch(err => errorHandler(res, err));
        }
        
    getByMeta(req, res) {
        let queryArray = queryValidation(req.query, ['tags', 'limit', 'offset']);
        return this.wineService.searchWineByTag(queryArray)
            .then(data => res.status(200).json(data))
            .catch(err => errorHandler(res, err));
    }
}

module.exports = WineRouter;