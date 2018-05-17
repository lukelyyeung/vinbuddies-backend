exports.up = function(knex, Promise) {
    return knex.schema.createTable('wine_meta', function (table) {
        table.increments().unique();
        table.integer('wine_id');
        table.foreign('wine_id').references('wines.wine_id');
        table.integer('metadata_id');
        table.foreign('metadata_id').references('metadata.metadata_id');
        table.timestamps(false, true);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('wine_meta');
};
