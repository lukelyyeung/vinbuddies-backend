const axios = require('axios');
const jwt = require('jwt-simple');
const config = require('../utils/config');
const bcrypt = require('../utils/bcrypt');
const AUTH_STATUS = require('../constant/authConstant');

class LoginService {
    constructor(knex) {
        this.knex = knex;
    }

    async localSignup(reqBody) {

        let user = await this.findUser({
            email: reqBody.email,
            provider: 'local'
        });

        if (user.id > 0) {
            throw new Error(AUTH_STATUS.SIGNUP_USER_EXIST);
        } else if (user.id < 0) {
            throw new Error(AUTH_STATUS.SERVER_ERROR);
        }

        let password = await bcrypt.hashPassword(reqBody.password);
        let status = await this.createUser({
            name: reqBody.name,
            email: reqBody.email,
            password: password,
            provider: 'local'
        });

        if (status < 0) {
            throw new Error(AUTH_STATUS.SERVER_ERROR);
        }

        return AUTH_STATUS.SIGNUP_SUCCESSFUL;
    }

    async localLogin(reqBody) {

        let user = await this.findUser({
            email: reqBody.email,
            provider: 'local'
        });
        if (user.id === 0) {
            throw new Error(AUTH_STATUS.LOGIN_NO_USER);
        } else if (user.id < 0) {
            throw new Error(AUTH_STATUS.SERVER_ERROR);
        }

        let Validity = await bcrypt.checkPassword(reqBody.password, user.password);
        if (!Validity) {
            throw new Error(AUTH_STATUS.LOGIN_INVALID);
        }

        let payload = { id: user.id };

        return this.jwtEncode(payload);
    }

    async facebookLogin(reqBody) {
        if (!reqBody.access_token) {
            throw new Error(AUTH_STATUS.LOGIN_NO_ACCESSTOKEN);
        };

        let accessToken = reqBody.access_token;
        let data = await axios(`https://graph.facebook.com/me?access_token=${accessToken}`)
            .catch((err) => {
                throw new Error(AUTH_STATUS.LOGIN_NO_ACCESSTOKEN);
            });

        let user = await this.findUser({
            social_id: data.data.id,
            provider: 'facebook'
        });

        if (user.id > 0) {
            return this.jwtEncode({ id: user.id });
        };

        let status = this.createUser({
            social_id: data.data.id,
            name: data.data.name,
            provider: 'facebook',
        });

        if (status < 0) {
            throw new Error(AUTH_STATUS.SERVER_ERROR);
        }

        return this.jwtEncode({ id: status.id });
    }

    findUser(user) {
        return this.knex('users').first('id', 'name', 'password').where(user)
            .then((userInfo) => (typeof userInfo === 'undefined') ? { id: 0 } : userInfo)
            .catch((err) => {
                console.log(err);
                return { id: -1 };
            });
    }

    createUser(user) {
        return this.knex('users').insert(user).returning('id')
            .then((userId) => ({ id: userId[0] }))
            .catch((err) => {
                console.log(err);
                return { id: -1 };
            });
    }

    jwtEncode(payload) {
        let token = jwt.encode(payload, config.jwtSecret);
        return {
            status: AUTH_STATUS.LOGIN_SUCCESSFUL, 
            token: token 
        };
    }
}

module.exports = LoginService; 