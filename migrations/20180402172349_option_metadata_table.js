exports.up = function(knex, Promise) {
    return knex.schema.createTable('option_metadata', function (table) {
        table.increments().unique();
        table.integer('option_id').notNullable();
        table.foreign('option_id').references('options.option_id')
        table.integer('metadata_id').notNullable();
        table.foreign('metadata_id').references('metadata.metadata_id')
        table.timestamps(false, true);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('option_metadata');
};
