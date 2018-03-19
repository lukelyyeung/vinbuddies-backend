
exports.up = function (knex, Promise) {
  return knex.schema.createTable('options', function (table) {
    table.increments('option_id').unique();
    table.string('text').notNullable();
    table.string('implication').notNullable();
    table.boolean('expired').defaultTo(false).notNullable();
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('options');
};
