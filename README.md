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
DEVELOPMENT_DB=your_db_name
DEVELOPMENT_DB_PASSWORD=your_db_user_password
DEVELOPMENT_DB_USER=your_db_username
```
After that, run the migration files with golbal knex command (required knex installed in global environment)
```
knex migrate:latest
```
At last, run `node app.js` to start the server.

## api/v1/auth ##

| Method| URL| POST BODY|Description|Expected output|
|:-----|:----|:---------|:----------|:--------------|
| POST | /login    | { email: string, password: string } | Local login with email and password | { token: string } | 
| POST | /signup   | { email: string, name: string, password: string } | Local signup | 'LOGIN_SUCCESSFUL'|
| POST | /facebook | { access_Token : string } | Facebook login, register in data if first visit | { token: string } |

### Local signup example ###
```
curl -i -X POST \
    -H "Content-Type:application/json" \
    -d '{
            "email": "email", 
            "password": "password", 
            "name": "testUser"  
        }' \
    http://localhost:8080/api/v1/auth/signup/ 
```
### Local login example ###
```
curl -i -X POST \
    -H "Content-Type:application/json" \
    -d '{
            "email": "email", 
            "password": "password"
        }' \
    http://localhost:8080/api/v1/auth/login/ 
```
### Facebook login ###
```
curl -i -X POST \
    -H "Content-Type:application/json" \
    -d '{
            "access_token": "EAAdOLKLZAWIYBAN8t1QfxSZCVQZBinOguZCts3Bvny68DtZCgw9sluvS3s2ebQd8DrrCt1gr54HYGEfZBiSEy8UD7HwKvGWZBZBUMQfXZB6VLVg5mfYr912ZAm2fjEMp58bxZCQFfD6CwooZANmGh1dWvfp7Nm19vA8C2OWZCLDUPc0CrXNpJtdOXHzM5byYxD6XfX4vve0n6atCBH834BJv0lgXKZAMg7iGmkhlMuY6EfKX1mUgZDZD"
        }' \
    http://localhost:8080/api/v1/auth/facebook/ 
```

## api/v1/user ##
### api/v1/user ###
| Method| URL| POST BODY|Description|Expected output|
|:-----|:----|:---------|:----------|:--------------|
|GET|/all|empty|Get user list|[{ user_id: number, name: string, password: string, socialId: string, provider: string, role: string }]|
|GET|/:userId|empty|Get particular user|{ user_id: number, name: string, password: string, socialId: string, provider: string, role: string }|
|POST|/|{ name: string, password: string, socialId: string, provider: string, role: string }|Add user|{userId: userID, status: 'ADD_USER_SUCCESSFUL' }|
|PATCH|/:userId|{ name: string, password: string, socialId: string, provider: string, role: string }|Update userInfo|{userId: userID, status: 'UPDATE_USER_SUCCESSFUL' }|
|DELETE|/:userId|empty|Delete particular user|{ userId: number, status: 'DELETE_USER_SUCCESSFUL' }|

### api/v1/user/:userId/eventjournal ###
| Method| URL| POST BODY|Description|Expected output|
|:-----|:----|:---------|:----------|:--------------|
|||||
|||||
|||||
|||||

### api/v1/user/questionhisotry ###
| Method| URL| POST BODY|Description|Expected output|
|:-----|:----|:---------|:----------|:--------------|
|||||
|||||
|||||
|||||

## api/v1/event/ ##
### api/v1/event/ ###
| Method| URL| POST BODY|Description|Expected output|
|:-----|:----|:---------|:----------|:--------------|
|||||
|||||
|||||
|||||

## api/v1/questions ##
### api/v1/questions ###
| Method| URL| POST BODY|Description|Expected output|
|:-----|:----|:---------|:----------|:--------------|
|||||
|||||
|||||
|||||

### api/v1/questions/options ###
| Method| URL| POST BODY|Description|Expected output|
|:-----|:----|:---------|:----------|:--------------|
|||||
|||||
|||||
|||||

