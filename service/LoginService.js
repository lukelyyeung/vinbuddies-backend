const axios = require('axios');
const jwt = require('jwt-simple');
const config = require('../utils/config');
const bcrypt = require('../utils/bcrypt');
const { SIGNUP_STATUS, LOGIN_STATUS } = require('../constant/authConstant');

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
            throw new Error(SIGNUP_STATUS.USER_EXIST);
        } else if (user.id < 0) {
            throw new Error(SIGNUP_STATUS.SERVERERROR);
        }

        let password = await bcrypt.hashPassword(reqBody.password);
        let status = await this.createUser({
            name: reqBody.name,
            email: reqBody.email,
            password: password,
            provider: 'local'
        });

        if (status < 0) {
            throw new Error(SIGNUP_STATUS.SERVERERROR);
        }

        return SIGNUP_STATUS.SUCCESSFUL;
    }

    async localLogin(reqBody) {

        let user = await this.findUser({
            email: reqBody.email,
            provider: 'local'
        });

        if (user.id === 0) {
            throw new Error(LOGIN_STATUS.NOUSER);
        } else if (user.id < 0) {
            throw new Error(LOGIN_STATUS.SERVERERROR);
        }

        let Validity = await bcrypt.checkPassword(reqBody.password, user.password);
        if (!Validity) {
            throw new Error(LOGIN_STATUS.INVALID);
        }

        let payload = {
            id: user.id,
        };

        return this.jwtEncode(payload);
    }

    async facebookLogin(reqBody) {
        if (!reqBody.access_token) {
            throw new Error(LOGIN_STATUS.NOACCESSTOKEN);
        };

        let accessToken = reqBody.access_token;
        let data = await axios({
            method: 'get',
            url:`https://graph.facebook.com/me?access_token=${accessToken}`})
            .catch((err) => {
                throw new Error(LOGIN_STATUS.NOACCESSTOKEN);
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
            throw new Error(LOGIN_STATUS.SERVERERROR);
        } 

        return this.jwtEncode({ id: status.id });    
    }

    jwtEncode(payload) {
        let token = jwt.encode(payload, config.jwtSecret);
        return { token: token };
    }

    findUser(user) {
        return this.knex('users').first('id', 'name', 'password').where(user)
            .then((userInfo) => {

                if (typeof userInfo === 'undefined') {
                    return { id: 0 };
                }
                return {
                    id: userInfo.id,
                    name: userInfo.name,
                    password: userInfo.password
                };
            })
            .catch((err) => {
                console.log(err);
                return { id: -1 };
            });
    }

    createUser(user) {
        return this.knex('users').insert(user).returning('id')
            .then((userId) => {
                return { id: userId[0] }
            })
            .catch((err) => {
                console.log(err);
                return { id: -1 };
            });
    }
}

module.exports = LoginService; 