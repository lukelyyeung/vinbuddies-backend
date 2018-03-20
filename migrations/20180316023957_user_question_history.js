exports.up = function(knex, Promise) {
    return knex.schema.createTable('user_question_history', function(table) {
        table.increments().unique();
        table.integer('user_id').notNullable();
        table.integer('question_id').notNullable();
        table.integer('option_id').notNullable();
        table.foreign('user_id').references('users.id');
        table.foreign('question_id').references('questions.question_id');
        table.foreign('option_id').references('options.option_id');
        table.unique(['user_id', 'question_id', 'option_id']);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('user_question_history');
};
