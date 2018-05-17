const fs = require('fs');
require('dotenv').config({ path: '../.env' });
const path = require('path');
const NODE_ENV = 'staging';
const knexFile = require('../knexfile')[NODE_ENV];
console.log(knexFile);
const knex = require('knex')(knexFile);
const {promisify} = require('util');
const writeFileAsync = promisify(fs.writeFile);

(async () => {
    let wineData = await knex('wines')
        .select('*')
        .catch(console.error);
    writeFileAsync(path.join(__dirname, 'wineTable.json'), JSON.stringify(wineData), 'utf8')
        .then(console.log('success'))
        .catch(console.error);
})();