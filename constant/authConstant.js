const SIGNUP_STATUS = {
    SUCCESSFUL : 'SIGNUP_SUCCESSFUL',
    USER_EXIST : 'SIGNUP_FAIL_USER_EXIST',
    SERVER_ERROR: 'SIGNUP_FAIL_SERVERERROR' 
}

const LOGIN_STATUS = {
    SUCCESSFUL: 'LOGIN_SUCCESSFUL',
    NO_USER: 'LOGIN_FAIL_NO_USER',
    INVALID: 'INVALID_PASSWORD',
    NO_ACCESSTOKEN: 'LOGIN_FAIL_NO_ACCESSTOKEN',
    SERVER_ERROR: 'LOGIN_FAIL_SERVERERROR',
}

module.exports = {
    SIGNUP_STATUS: SIGNUP_STATUS,
    LOGIN_STATUS: LOGIN_STATUS
}