exports.up = function (knex, Promise) {
    return knex.schema.createTable('event_photo', function (table) {
        table.increments().unique();
        table.integer('event_id');
        table.foreign('event_id').references('events.event_id');
        table.string('photo_path');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('event_photo');
};

