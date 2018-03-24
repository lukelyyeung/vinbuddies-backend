
exports.up = function(knex, Promise) {
    return knex.schema.createTable('event_wine', function (table) {
        table.increments().unique();
        table.integer('event_id');
        table.foreign('event_id').references('events.event_id');
        table.string('wine_photo_path');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('event_wine');
};
