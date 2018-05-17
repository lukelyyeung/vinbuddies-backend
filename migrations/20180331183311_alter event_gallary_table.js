
exports.up = function (knex, Promise) {
    return knex.schema.table('event_gallery', function (table) {
        table.dropColumn('gallery_path');
        table.string('photo_path');
        table.integer('wine_id');
        table.foreign('wine_id').references('wines.wine_id');
        table.string('type').notNullable();
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('event_gallery', function (table) {
        table.string('gallery_path');
        table.dropColumn('photo_path');
        table.dropColumn('wine_id');
        table.dropColumn('type');
    });
};
