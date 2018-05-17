
exports.up = function(knex, Promise) {
    return knex.schema.createTable('wines', function (table) {
        table.increments('wine_id');
        table.string('wine_name');
        table.string('picture');
        table.string('country');
        table.string('notes');
        table.string('grape_blend');
        table.string('average_user_rating');
        table.string('region_appellation');
        table.string('country_hierarchy');
        table.string('producer');
        table.string('food_suggestion');
        table.string('wine_style');
        table.string('alcohol_content');
        table.jsonb('awards');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('wines');
};
