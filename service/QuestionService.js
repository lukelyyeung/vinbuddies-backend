const QUESTION_STATUS = require('../constant/questionConstant');

class QuestionService {
    constructor(knex) {
        this.knex = knex;
    }

    async createQuestion(reqBody) {
        let question = reqBody.question;
        let options = reqBody.options;
        let questionId;
        try {
            await this.knex.transaction(async (trx) => {
                questionId = await this.insertQuestionTransacting(trx, question);
                await this.insertOptionTransacting(trx, questionId[0], options)
                    .then(trx.commit);
            });

            return ({
                status: QUESTION_STATUS.CREATE_QUESTION_SUCCESSFUL,
                id: questionId[0]
            });

        } catch (err) {
            console.log(err);
            throw new Error(QUESTION_STATUS.SERVER_ERROR);
        }
    }

    queryQuestion(questionId=null) {
        return this.knex
            .select(['questions.question_id', 'questions.text as questionText', 'questions.expired as questionExpired', 'options.*'])
            .from('questions')
            .join('question_options', 'questions.question_id', 'question_options.question_id')
            .join('options', 'question_options.option_id', 'options.option_id')
            .modify(function (queryBuilder) {
                if (questionId) {
                    queryBuilder.where('questions.question_id', questionId);
                };
            });
    }

    async getQuestion(questionId) {
        try {

            let questionWithOptions = await this.queryQuestion(questionId);


            if (typeof questionWithOptions === 'undefined' || questionWithOptions.length <= 0) {
                throw new Error(QUESTION_STATUS.READ_FAIL_NO_QUESTION);
            };

            return {
                status: QUESTION_STATUS.READ_QUESTION_SUCCESSFUL,
                question: this.mapOption(questionWithOptions)
            };

        } catch (err) {
            if (err.message === QUESTION_STATUS.READ_FAIL_NO_QUESTION) {
                throw new Error(QUESTION_STATUS.READ_FAIL_NO_QUESTION);
            };
            console.log(err);
            throw new Error(QUESTION_STATUS.SERVER_ERROR);
        }
    }

    async getAllQuestions() {
        try {

            let questionWithOptions = await this.queryQuestion();

            if (typeof questionWithOptions === 'undefined' || questionWithOptions.length <= 0) {
                throw new Error(QUESTION_STATUS.READ_QUESTION_FAIL_NO_QUESTION);
            };

            let sortedQuestion = questionWithOptions.reduce((dictionary, entry) => {
                dictionary[entry.question_id] = dictionary[entry.question_id] || [];
                dictionary[entry.question_id].push(entry);
                return dictionary;
            }, {});

            let questionSet = {
                status: QUESTION_STATUS.READ_QUESTION_SUCCESSFUL,
                questions: []
            }

            for (let id in sortedQuestion) {
                questionSet.questions.push(this.mapOption(sortedQuestion[id]));
            }

            return questionSet;

        } catch (err) {
            if (err.message === QUESTION_STATUS.READ_QUESTION_FAIL_NO_QUESTION) {
                throw new Error(QUESTION_STATUS.READ_QUESTION_FAIL_NO_QUESTION);
            };
            console.log(err);
            throw new Error(QUESTION_STATUS.SERVER_ERROR);
        }
    }

    async insertOption(questionId, reqBody) {
        try {
            let options = reqBody.options;

            let entity = await this.queryQuestion(questionId);
            if (typeof entity === 'undefined' || entity.length <= 0) {
                return { status: QUESTION_STATUS.UPDATE_NO_ENTITY };
            };

            await this.knex.transaction(async (trx) => {
                await this.insertOptionTransacting(trx, questionId, options).then(trx.commit);
            });
        } catch (err) {
            console.log(err);
            throw new Error(QUESTION_STATUS.SERVER_ERROR);
        }

        return {
            status: QUESTION_STATUS.CREATE_OPTION_SUCCESSFUL,
        };
    }

    async updateQuestion(questionId, reqBody) {
        let question = reqBody.question;
        let options = reqBody.options;
        try {

            let entity = await this.queryQuestion(questionId);
            if (typeof entity === 'undefined' || entity.length <= 0) {
                return { status: QUESTION_STATUS.UPDATE_NO_ENTITY };
            };

            await this.knex.transaction(async (trx) => {
                let result = await this.knex('questions').transacting(trx).where('question_id', questionId).update(question);
                while (options.length > 0) {
                    let option = options.pop();
                    await this.knex('options').transacting(trx).where('option_id', option.option_id).update(option);
                }
            });
            return { status: QUESTION_STATUS.UPDATE_SUCCESSFUL };

        } catch (err) {
            throw new Error(err.message);
        }
    }

    insertQuestionTransacting(trx, question) {
        return this.knex('questions')
            .transacting(trx)
            .insert(question)
            .returning('question_id')
            .catch(() => {
                console.log(err);
                throw new Error(QUESTION_STATUS.QUESTION_FAIL_INVALID_INPUT);
            });
    }

    async insertOptionTransacting(trx, questionId, options) {
        let chunkSize = options.length;
        let ids = await this.knex.batchInsert('options', options, chunkSize)
            .transacting(trx)
            .returning('option_id');

        let relations = ids.map(id => ({ question_id: questionId, option_id: id }));

        return this.knex.batchInsert('question_options', relations, chunkSize)
            .transacting(trx);
    }

    mapOption(rawQuestion) {
        let question = {
            id: rawQuestion[0].question_id,
            text: rawQuestion[0].questionText,
            expired: rawQuestion[0].questionExpired,
            options: []
        };

        rawQuestion.forEach(e => {
            question.options.push({
                id: e.option_id,
                text: e.text,
                implication: e.implication,
                expired: e.expired
            });
        });
        return question;
    }
}

module.exports = QuestionService;