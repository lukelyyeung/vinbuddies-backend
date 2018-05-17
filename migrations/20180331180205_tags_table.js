exports.up = function(knex, Promise) {
    return knex.schema.createTable('tags', function (table) {
        table.increments('tag_id').unique();
        table.string('tag_name');
        table.integer('category_id');
        table.foreign('category_id').references('category.category_id')
        table.timestamps(false, true);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('tags');
};
