const express = require('express');
const { SIGNUP_STATUS, LOGIN_STATUS } = require('../constant/authConstant')

module.exports = class LoginRouter {
    constructor(loginService) {
        this.router = express.router();
        this.router.post('/login', this.localLogin.bind(this));
        this.router.post('/signup', this.localSignup.bind(this));
        this.router.post('/facebook', this.facebooklogin.bind(this));
        return this.router;
    }

    localLogin(req, res) {
        return this.loginService.localLogin(req.body)
            .then(jwt => res.json(jwt))
            .catch(err => {
                console.log(err);
                res.sendStatus(401);
            })
    }

    localSignup(req, res) {
        return this.Service.localLogin(req.body)
            .then(status => res.json(status))
            .catch(err => {
                console.log(err);
                res.sendStatus(401);
            })
    }

    facebooklogin(req, res) {
        return this.loginService.facebookLogin(req.body)
            .then(jwt => res.json(jwt))
            .catch(err => {
                console.log(err);
                res.sendStatus(401);
            })
    }

    ErrorHandle(res, error) {
        switch (error) {
            case SIGNUP_STATUS.USER_EXIST:
            case LOGIN_STATUS.NOACCESSTOKEN:
            case LOGIN_STATUS.NOUSER:
                return { error: error.message };
                break;
            default:
                return { error: 'UNKNOWN_AUTH_ERROR' }
        }
    }
}