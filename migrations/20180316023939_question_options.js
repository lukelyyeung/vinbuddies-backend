
exports.up = function (knex, Promise) {
    return knex.schema.createTable('question_options', function (table) {
        table.increments().unique();
        table.integer('question_id');
        table.integer('option_id');
        table.foreign('question_id').references('questions.question_id');
        table.foreign('option_id').references('options.option_id');
        table.unique(['question_id', 'option_id']);
    });
}

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('question_options');
};
