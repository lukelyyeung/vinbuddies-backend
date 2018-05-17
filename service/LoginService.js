const axios = require('axios');
const jwt = require('jwt-simple');
const config = require('../utils/config');
const bcrypt = require('../utils/bcrypt');
const AUTH_STATUS = require('../constant/authConstant');
const GENERAL_STATUS = require('../constant/generalConstant');
const emailRegex = new RegExp('/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/');

class LoginService {
    constructor(knex) {
        this.knex = knex;
    }

    async localSignup(reqBody) {
        // check if the email is empty or consist of whtiespace only
        if (emailRegex.test(reqBody.email)) {
            throw new Error(AUTH_STATUS.INVALID_INPUT);
        };
        let user = await this.findUser({
            email: reqBody.email,
            provider: 'local'
        },
            {
                username: reqBody.username,
                provider: 'local'
            });

        if (user.id > 0) {
            throw new Error(AUTH_STATUS.SIGNUP_USER_EXIST);
        } else if (user.id < 0) {
            throw new Error(GENERAL_STATUS.INVALID_INPUT);
        }

        let password = await bcrypt.hashPassword(reqBody.password);
        let newUser = await this.createUser({
            username: reqBody.username,
            email: reqBody.email,
            password: password,
            provider: 'local'
        });
        if (newUser.id <= 0) {
            throw new Error(AUTH_STATUS.INVALID_INPUT);
        }
        return {
            userId: newUser.id,
            status: AUTH_STATUS.SIGNUP_SUCCESSFUL
        };
    }

    async localLogin(reqBody) {
        let user = await this.findUser({
            email: reqBody.email,
            provider: 'local'
        }, null, ['user', 'admin'], true);

        if (user.id === 0) {
            throw new Error(AUTH_STATUS.LOGIN_NO_USER);
        } else if (user.deleted) {
            throw new Error(AUTH_STATUS.LOGIN_USER_DELETED);
        } else if (user.id < 0) {
            throw new Error(GENERAL_STATUS.DATABASE_ERROR);
        }

        let Validity = await bcrypt.checkPassword(reqBody.password, user.password);
        if (!Validity) {
            throw new Error(AUTH_STATUS.LOGIN_INVALID);
        }

        let payload = {
            id: user.id,
            role: user.role,
            first_login: user.first_login
        };

        return this.jwtEncode(payload);
    }

    async facebookLogin(reqBody) {
        if (!reqBody.accessToken) {
            throw new Error(AUTH_STATUS.LOGIN_NO_ACCESSTOKEN);
        };

        let accessToken = reqBody.accessToken;
        let data = await axios(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,gender,picture.width(960).height(960)`)
            .then(data => data.data)
            .catch((err) => {
                console.log(err);
                throw new Error(AUTH_STATUS.LOGIN_NO_ACCESSTOKEN);
            });

        let user = await this.findUser({
            social_id: data.id,
            provider: 'facebook',
        }, null, ['user', 'admin'], true);

        if (user.id > 0) {
            return this.jwtEncode({
                id: user.id,
                role: user.role,
                first_login: user.first_login
            });
        } else if (user.deleted) {
            throw new Error(AUTH_STATUS.LOGIN_USER_DELETED);
        }

        let newUser = await this.createUser({
            social_id: data.id,
            username: data.name,
            picture: data.picture.data.url,
            provider: 'facebook',
        });

        if (newUser.id <= 0) {
            throw new Error(GENERAL_STATUS.DATABASE_ERROR);
        }

        return this.jwtEncode({
            id: newUser.id,
            role: newUser.role,
            first_login: newUser.first_login
        });
    }

    async jwtLogin(reqHeader) {
        let { authorization: token } = reqHeader;
        console.log(reqHeader);
        let decoded = jwt.decode(token.replace('Bearer ', ''), config.publicKey);
        let user = await this.findUser(decoded);
        if (user.id <= 0) {
            throw new Error(GENERAL_STATUS.NOT_AUTHORIZED);
        }
        return {
            status: AUTH_STATUS.LOGIN_SUCCESSFUL
        };
    }

    findUser(user, additionalInfo, range = ["user", "admin"], includeDeleted = false) {
        if (!includeDeleted) {
            user.deleted = false;
        }
        return this.knex('users').first('*').where(user).andWhere('role', 'in', range)
            .modify(queryBuilder => {
                if (additionalInfo) {
                    queryBuilder.orWhere(additionalInfo);
                }
            })
            .then((userInfo) => (typeof userInfo === 'undefined') ? { id: 0 } : userInfo)
            .catch((err) => {
                console.log(err);
                return { id: -1 };
            });
    }

    createUser(user) {
        return this.knex('users').insert(user).returning(['id', 'role', 'first_login'])
            .then((userInfo) => userInfo[0])
            .catch((err) => {
                console.log(err);
                return { id: -1 };
            });
    }

    jwtEncode(payload) {
        let token = jwt.encode(payload, config.privateKey, config.jwtAlgorithm);
        return {
            status: AUTH_STATUS.LOGIN_SUCCESSFUL,
            token: token
        };
    }
}

module.exports = LoginService; 