exports.up = function(knex, Promise) {
    return knex.schema.createTable('questions', function (table) {
        table.increments('question_id').unique();
        table.string('text');
        table.boolean('expired');
    });
}
exports.down = function(knex, Promise) {
    return knex.schema.dropTable('questions');
};
