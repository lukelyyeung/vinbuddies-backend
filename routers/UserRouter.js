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
            .then(user => res.json(user))
            .catch(err => res.json(this.errorHandler(err)));
    }

    getAll(req, res) {
        return this.userService.getAllUser()
            .then(users => res.json(users))
            .catch(err => res.json(this.errorHandler(err)));
    }

    post(req, res) {
        return this.userService.createUser(req.body)
            .then(status => res.json(status))
            .catch(err => res.json(this.errorHandler(err)));

    }

    update(req, res) {
        return this.userService.updateUser(req.params.userId, req.body)
            .then(status => res.json(status))
            .catch(err => res.json(this.errorHandler(err)));
    }

    delete(req, res) {
        return this.userService.deleteUser(req.params.userId)
            .then(status => res.json(status))
            .catch(err => res.json(this.errorHandler(err)));
    }

    errorHandler(err) {
        switch (err.message) {
            case USER_STATUS.NO_USER:
            case USER_STATUS.SERVER_ERROR:
            case USER_STATUS.USER_EXIST: {
                return { error: err.message };
                break;
            }

            default: {
                console.log(err);
                return { error: 'UNKNOWN_USER_ERROR' };
            }
        }
    }
}

module.exports = UserRouter;