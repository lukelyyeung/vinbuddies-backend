# VinBuddies API v1 guide #

## Set up ##
Simply run `npm install` to install the dependency.

Also install the postgresql as the database

```
$ sudo apt-get update
$ sudo apt-get install postgresql postgresql-contrib
```
I used [knex](http://knexjs.org/#Interfaces-Streams) as schema builder and conduct the query on the database.

In case you use other database like MariaDB or MySql etc., please also uninstall the pg client and install the corresponding client.
```
$ npm uninstall pg
```
Then, add one of the following (adding a --save) flag:
```
$ npm install sqlite3
$ npm install mysql
$ npm install mysql2
$ npm install mariasql
$ npm install strong-oracle
$ npm install oracle
$ npm install mssql
```
Then, create your .env file, it should at least include
```
DEVELOPMENT_DB_HOST=localhost
NODE_ENV=development
DEVELOPMENT_DB_CLIENT=your_database_client
DEVELOPMENT_DB=your_db_username
DEVELOPMENT_DB_PASSWORD=your_db_user_password
DEVELOPMENT_DB_USER=your_db_userusername
```
After that, run the migration files with golbal knex command (required knex installed in global environment)
```
knex migrate:latest
```
At last, run ```npm start``` or ```node app.js``` to start the server.

## Current Database ER Diagram on LucidChart
https://www.lucidchart.com/invitations/accept/e689709c-c97b-46c1-b801-52aab6453b27

## Authenticate requests an http header called "Authorization" :
```
-H "Authorization: Bearer <jwtToken>"
```
&nbsp;

## API guide wirtten in Swagger ##
http://www.vinbuddies.com/guide
1. Select the server as www.vinbuddies.com
2. Press Authorize and input the jwt token
3. Click try-out in each section and input neccessary parameter
4. Wait for the response