const express = require('express');
const { SIGNUP_STATUS, LOGIN_STATUS } = require('../constant/authConstant');

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
            .then(jwt => res.json(jwt))
            .catch(err => res.json(this.errorHandler(err)));
    }

    localSignup(req, res) {
        return this.loginService.localSignup(req.body)
            .then(status => res.json(status))
            .catch(err => res.json(this.errorHandler(err)));
    }

    facebooklogin(req, res) {
        return this.loginService.facebookLogin(req.body)
            .then(jwt => res.json(jwt))
            .catch(err => res.json(this.errorHandler(err)));
    }

    errorHandler(err) {
        console.log(err);
        switch (err.message) {
            case SIGNUP_STATUS.USER_EXIST:
            case SIGNUP_STATUS.SERVER_ERROR:
            case LOGIN_STATUS.NO_ACCESSTOKEN:
            case LOGIN_STATUS.INVALID:
            case LOGIN_STATUS.NO_USER:
            case LOGIN_STATUS.SERVER_ERROR: {
                return { error: err.message };
                break;
            }
            default: {
                console.log(err);
                return { error: 'UNKNOWN_AUTH_ERROR' }
            }
        }
    }
}

module.exports = LoginRouter;