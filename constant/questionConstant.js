const QUESTION_STATUS = {
    //* successful status
    READ_OPTION_SUCCESSFUL: 'READ_OPTION_SUCCESSFUL',
    READ_QUESTION_SUCCESSFUL: 'READ_QUESTION_SUCCESSFUL',
    CREATE_QUESTION_SUCCESSFUL: 'CREATE_QUESTION_SUCCESSFUL',
    CREATE_OPTION_SUCCESSFUL: 'CREATE_OPTION_SUCCESSFUL',
    UPDATE_QUESTION_SUCCESSFUL: 'UPDATE_QUESTION_SUCCESSFUL',
    UPDATE_OPTION_SUCCESSFUL: 'UPDATE_OPTION_SUCCESSFUL',
    //* fail status
    READ_OPTION_FAIL_NO_OPTION: 'READ_OPTION_FAIL_NO_OPTION',
    READ_QUESTION_FAIL_NO_QUESTION: 'READ_QUESTION_FAIL_NO_QUESTTION',
    QUESTION_FAIL_INVALID_INPUT: 'QUESTION_FAIL_INVALID_INPUT',
    SERVER_ERROR: 'QUESTION_SERVER_ERROR',
}

module.exports = QUESTION_STATUS;