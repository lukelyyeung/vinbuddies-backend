exports.up = function(knex, Promise) {
    return knex.schema.table('user_question_history', function(table) {
        table.boolean('deleted').defaultTo(false);
        table.dropUnique(['user_id', 'question_id', 'option_id']);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('user_question_history', function(table) {
        table.dropColumn('deleted');
        table.unique(['user_id', 'question_id', 'option_id']);
    })
};
