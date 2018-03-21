const express = require('express');
const USER_STATUS = require('../constant/userConstant');

class UserRouter {

    constructor(userService) {
        this.userService = userService;
    }

    router() {
        let router = express.Router();
        router.post('/', this.post.bind(this));
        router.get('/alluser', this.getAll.bind(this));
        router.get('/:userId', this.get.bind(this));
        router.patch('/:userId', this.update.bind(this));
        router.delete('/:userId', this.delete.bind(this));
        return router;
    }

    get(req, res) {
        return this.userService.getUser(req.params.userId)
            .then(user => res.status(200).json(user))
            .catch(err => res.json(this.errorHandler(res, err)));
    }

    getAll(req, res) {
        return this.userService.getAllUser()
            .then(users => res.status(200).json(users))
            .catch(err => res.json(this.errorHandler(res, err)));
    }

    post(req, res) {
        return this.userService.createUser(req.body)
            .then(status => res.status(201).json(status))
            .catch(err => res.json(this.errorHandler(err)));

    }

    update(req, res) {
        return this.userService.updateUser(req.params.userId, req.body)
            .then(status => res.status(200).json(status))
            .catch(err => res.json(this.errorHandler(res, err)));
    }

    delete(req, res) {
        return this.userService.deleteUser(req.params.userId)
            .then(status => res.status(200).json(status))
            .catch(err => res.json(this.errorHandler(res, err)));
    }

    errorHandler(res, err) {
        switch (err.message) {
            case USER_STATUS.NO_USER: {
                res.status(404).json({ error: err.message });
                break;
            }

            case USER_STATUS.SERVER_ERROR: {
                res.status(500).json({ error: err.message });
                break;
            }

            case USER_STATUS.USER_EXIST:
            case USER_STATUS.INFO_USED: {
                res.status(412).json({ error: err.message });
                break;
            }

            default: {
                console.log(err);
                res.status(520).json({ error: USER_STATUS.UNKNOWN_ERROR });
            }
        }
    }
}

module.exports = UserRouter;