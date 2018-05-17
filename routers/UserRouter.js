const express = require('express');
const queryValidation = require('../utils/queryValidation');
const errorHandler = require('../utils/errorHandler');

class UserRouter {

    constructor(adminUserService) {
        this.userService = adminUserService;
    }

    router() {
        let router = express.Router();
        router.post('/', this.post.bind(this));
        router.get('/alluser', this.search.bind(this));
        router.get('/:userId', this.get.bind(this));
        router.patch('/:userId', this.update.bind(this));
        router.delete('/:userId', this.delete.bind(this));
        return router;
    }

    get(req, res) {
        return this.userService.getUser(req)
            .then(user => res.status(200).json(user))
            .catch(err => errorHandler(res, err));
    }

    search(req, res) {
        let queryArray = queryValidation(req.query, ['name', 'orderby', 'includedeleted','limit', 'offset']);
        return this.userService.searchUser(req, queryArray)
            .then(users => res.status(200).json(users))
            .catch(err => errorHandler(res, err));
    }

    post(req, res) {
        return this.userService.createUser(req)
            .then(status => res.status(201).json(status))
            .catch(err => errorHandler(res, err));

    }

    update(req, res) {
        return this.userService.updateUser(req)
            .then(status => res.status(200).json(status))
            .catch(err => errorHandler(res, err));
    }

    delete(req, res) {
        return this.userService.deleteUser(req)
            .then(status => res.status(200).json(status))
            .catch(err => errorHandler(res, err));
    }
}

module.exports = UserRouter;