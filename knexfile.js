// Update with your config settings.
require('dotenv').config();

module.exports = {
  development: {
    client: process.env.DEVELOPMENT_DB_CLIENT,
    connection: {
      database: process.env.DEVELOPMENT_DB,
      user: process.env.DEVELOPMENT_DB_USER,
      password: process.env.DEVELOPMENT_DB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: process.env.STAGE_DB_CLIENT,
    connection: {
      database: process.env.STAGE_DB,
      user:     process.env.STAGE_DB_USER,
      password: process.env.STAGE_DB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: process.env.PROD_DB_CLIENT,
    connection: {
      database: process.env.PROD_DB,
      user:     process.env.PROD_USER,
      password: process.env.PROD_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
