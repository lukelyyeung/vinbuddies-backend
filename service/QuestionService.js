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

                questionId = await this.insertQuestion(trx, question);

                await this.insertOptionTransacting(trx, questionId[0], options).then(trx.commit);
            });

        } catch (err) {
            console.log(err);
            throw new Error(QUESTION_STATUS.SERVER_ERROR);
        }
        return ({
            status: QUESTION_STATUS.CREATE_QUESTION_SUCCESSFUL,
            id: questionId[0]
        });
    }

    async queryQuestion(questionId=null) {
        return await this.knex
            .select(['questions.*', 'questions.text as questionText', 'questions.expired as questionExpired', 'options.*', 'question_options.question_id', 'question_options.option_id'])
            .from('questions')
            .join('question_options', 'questions.question_id', 'question_options.question_id')
            .join('options', 'question_options.option_id', 'options.option_id')
            .modify(function (queryBuilder) {
                if (questionId) {
                    queryBuilder.where('questions.question_id', questionId);
                }
            });
    }

    async insertOption(questionId, reqBody) {
        try {
            let options = reqBody.options;
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

    async insertOptionTransacting(trx, questionId, options) {
        let chunkSize = options.length;
        let ids = await this.knex.batchInsert('options', options, chunkSize)
            .transacting(trx)
            .returning('option_id')
            .catch(() => { throw new Error(QUESTION_STATUS.SERVER_ERROR) });
        console.log(ids);
        let relations = ids.map(id => ({ question_id: questionId, option_id: id }));
        console.log(relations);
        return this.knex.batchInsert('question_options', relations, chunkSize)
            .transacting(trx)
            .catch(() => { throw new Error(QUESTION_STATUS.SERVER_ERROR) })
    }

    async getQuestion(questionId) {
        try {

            let questionWithOptions = await this.queryQuestion(questionId);

            if (typeof questionWithOptions === 'undefined' || questionWithOptions.length <= 0) {
                throw new Error(QUESTION_STATUS.READ_QUESTION_FAIL_NO_QUESTION);
            };

            return {
                status: QUESTION_STATUS.READ_QUESTION_SUCCESSFUL,
                question: this.mapQuestion(questionWithOptions)
            };

        } catch (err) {
            if (err.message === QUESTION_STATUS.READ_QUESTION_FAIL_NO_QUESTION) {
                throw new Error(QUESTION_STATUS.READ_QUESTION_FAIL_NO_QUESTION);
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
                questionSet.questions.push(this.mapQuestion(sortedQuestion[id]));
            }

            return questionSet;

        } catch (err) {
            if (err.message === QUESTION_STATUS.READ_QUESTION_FAIL_NO_QUESTION) {
                throw new Error(QUESTION_STATUS.READ_QUESTION_FAIL_NO_QUESTION);
            };

            console.log(QUESTION_STATUS.SERVER_ERROR);
            throw new Error(QUESTION_STATUS.SERVER_ERROR);
        }
    }

    async updateQuestion(questionId, reqBody) {
        let question = {
            text: reqBody.text,
            expired: reqBody.expired
        };
        console.log(this.tidyUp(question));
        try {
            await this.knex('questions').where('question_id', questionId).update(this.tidyUp(question));
        } catch (err) {
            console.log(err);
            throw new Error(QUESTION_STATUS.QUESTION_FAIL_INPUT);
        }
        return { status: QUESTION_STATUS.UPDATE_QUESTION_SUCCESSFUL };
    }

    insertQuestion(trx, question) {
        return this.knex('questions')
            .transacting(trx)
            .insert(question)
            .returning('question_id')
            .catch(() => {
                throw new Error(QUESTION_STATUS.QUESTION_FAIL_INPUT);
            });
    }

    tidyUp(item) {

        let cleanObject = {};
        for (let prop in item) {
            if (item[prop] !== '' && typeof item[prop] !== 'undefined') {
                cleanObject[prop] = item[prop];
            }
        };
        return cleanObject;
    }


    mapQuestion(rawQuestion) {
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