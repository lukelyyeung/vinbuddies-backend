exports.up = function(knex, Promise) {
    return knex.schema.createTable('event_tags', function (table) {
        table.increments().unique();
        table.integer('event_id');
        table.foreign('event_id').references('events.event_id')
        table.integer('tag_id');
        table.foreign('tag_id').references('tags.tag_id')
        table.timestamps(false, true);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('event_tags');
};
