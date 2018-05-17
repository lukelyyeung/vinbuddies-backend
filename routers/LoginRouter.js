const express = require('express');
const errorHandler = require('../utils/errorHandler');

class LoginRouter {
    constructor(loginService) {
        this.loginService = loginService;
    }

    router() {
        let router = express.Router();
        router.post('/login', this.localLogin.bind(this));
        router.post('/signup', this.localSignup.bind(this));
        router.post('/facebook', this.facebookLogin.bind(this));
        router.post('/jwt', this.jwtLogin.bind(this));
        return router;
    }

    localLogin(req, res) {
        return this.loginService.localLogin(req.body)
            .then(jwt => res.status(200).json(jwt))
            .catch(err => errorHandler(res, err));
    }

    localSignup(req, res) {
        return this.loginService.localSignup(req.body)
            .then(status => res.status(201).json(status))
            .catch(err => errorHandler(res, err));
    }

    facebookLogin(req, res) {
        return this.loginService.facebookLogin(req.body)
            .then(jwt => res.status(200).json(jwt))
            .catch(err => errorHandler(res, err));
    }

    jwtLogin(req, res) {
        console.log(req.headers);
        return this.loginService.jwtLogin(req.headers)
            .then(jwt => res.status(200).json(jwt))
            .catch(err => errorHandler(res, err));
    }

}

module.exports = LoginRouter;