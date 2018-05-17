exports.up = function(knex, Promise) {
    return knex.schema.createTable('metadata', function (table) {
        table.increments('metadata_id').unique();
        table.string('tag');
        table.timestamps(false, true);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('metadata');
};
