const express = require('express');
const AUTH_STATUS = require('../constant/authConstant');

class LoginRouter {
    constructor(loginService) {
        this.loginService = loginService;
    }

    router() {
        let router = express.Router();
        router.post('/login', this.localLogin.bind(this));
        router.post('/signup', this.localSignup.bind(this));
        router.post('/facebook', this.facebooklogin.bind(this));
        return router;
    }

    localLogin(req, res) {
        return this.loginService.localLogin(req.body)
            .then(jwt => res.status(200).json(jwt))
            .catch(err => res.json(this.errorHandler(res, err)));
    }

    localSignup(req, res) {
        return this.loginService.localSignup(req.body)
            .then(status => res.status(201).json(status))
            .catch(err => res.json(this.errorHandler(res, err)));
    }

    facebooklogin(req, res) {
        return this.loginService.facebookLogin(req.body)
            .then(jwt => res.status(200).json(jwt))
            .catch(err => res.json(this.errorHandler(res, err)));
    }

    errorHandler(res, err) {
        switch (err.message) {
            case AUTH_STATUS.SIGNUP_USER_EXIST:
                res.status(412).json({ error: err.message });
                break;
            case AUTH_STATUS.LOGIN_INVALID:
            case AUTH_STATUS.LOGIN_NO_USER:
            case AUTH_STATUS.LOGIN_NO_ACCESSTOKEN: {
                res.status(401).json({ error: err.message });
                break;
            }
            case AUTH_STATUS.SERVER_ERROR: {
                res.status(500).json({ error: err.message });
                break;
            }
            default: {
                console.log(err);
                res.status(520).json({ error: AUTH_STATUS.UNKNOWN_ERROR });
            }
        }
    }
}

module.exports = LoginRouter;