const AUTH_STATUS = require('../constant/authConstant');
const USER_STATUS = require('../constant/userConstant');
const QUESTION_STATUS = require('../constant/questionConstant');
const QUESTION_HISTORY_STATUS = require('../constant/questionHistoryConstant');
const EVENT_STATUS = require('../constant/eventConstant');
const GENERAL_STATUS = require('../constant/generalConstant');
const errorHandler = (res, err) => {
    let msgs = {
        // General status error code
        [GENERAL_STATUS.NOT_AUTHORIZED]: 401,
        [GENERAL_STATUS.DATABASE_ERROR]: 500,
        [GENERAL_STATUS.UPLOAD_FAIL]: 500,
        [GENERAL_STATUS.SERVER_ERROR]: 500,
        [GENERAL_STATUS.UNKNOWN_ERROR]: 520,
        // Auth status error code
        [AUTH_STATUS.SIGNUP_USER_EXIST]: 412,
        [AUTH_STATUS.LOGIN_INVALID]: 401,
        [AUTH_STATUS.INVALID_INPUT]: 401,
        [AUTH_STATUS.LOGIN_NO_USER]: 401,
        [AUTH_STATUS.LOGIN_USER_DELETED]: 401,
        [AUTH_STATUS.LOGIN_NO_ACCESSTOKEN]: 401,

        // User info status error code
        [USER_STATUS.NO_USER]: 404,
        [USER_STATUS.USER_EXIST]: 412,
        [USER_STATUS.INFO_USED]: 412,

        // Question API status error code
        [QUESTION_STATUS.READ_FAIL_NO_QUESTION]: 404,
        [QUESTION_STATUS.POST_FAIL_INVALID_INPUT]: 412,

        // Question history API status error code
        [QUESTION_HISTORY_STATUS.POST_HISTORY_FAIL]: 404,
        [QUESTION_HISTORY_STATUS.INVALID_OPTION]: 404,
        [QUESTION_HISTORY_STATUS.GET_HISTORY_FAIL]: 404,
        [QUESTION_HISTORY_STATUS.DELETE_HISTORY_FAIL]: 404,

        // Event & event journal API status error code
        [EVENT_STATUS.NOT_FOUND]: 404,
        [EVENT_STATUS.UPDATE_FAIL]: 404,
        [EVENT_STATUS.DELETE_FAIL]: 404
    }

    let errCode = msgs[err.message];
    let errMessage = err.message;

    if (!errCode) {
        console.log(err.message);
        errMessage = GENERAL_STATUS.UNKNOWN_ERROR;
    }

    return res.status(errCode || 520).json({error: errMessage });
}

module.exports = errorHandler;