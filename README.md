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

#### *Local signup example* ####
```
curl -i -X POST \
    -H "Content-Type:application/json" \
    -d '{
            "email": "email", 
            "password": "password", 
            "name": "testUser"  
        }' \
    http://localhost:3000/api/v1/auth/signup/ 
```
#### *Local login example* ####
```
curl -i -X POST \
    -H "Content-Type:application/json" \
    -d '{
            "email": "email", 
            "password": "password"
        }' \
    http://localhost:3000/api/v1/auth/login/ 
```
#### *Facebook login example* ####
```
curl -i -X POST \
    -H "Content-Type:application/json" \
    -d '{
            "access_token": "EAAdOLKLZAWIYBAN8t1QfxSZCVQZBinOguZCts3Bvny68DtZCgw9sluvS3s2ebQd8DrrCt1gr54HYGEfZBiSEy8UD7HwKvGWZBZBUMQfXZB6VLVg5mfYr912ZAm2fjEMp58bxZCQFfD6CwooZANmGh1dWvfp7Nm19vA8C2OWZCLDUPc0CrXNpJtdOXHzM5byYxD6XfX4vve0n6atCBH834BJv0lgXKZAMg7iGmkhlMuY6EfKX1mUgZDZD"
        }' \
    http://localhost:3000/api/v1/auth/facebook/ 
```

## api/v1/user ##
### api/v1/user ###
| Method| URL| POST BODY|Description|Expected output|
|:-----|:----|:---------|:----------|:--------------|
|GET|/all|empty|Get user list|[{ user_id: number, name: string, password: string, socialId: string, provider: string, role: string }]|
|GET|/:userId|empty|Get particular user|{ user_id: number, name: string, password: string, socialId: string, provider: string, role: string }|
|POST|/|{ name: string, password: string, socialId: string, provider: string, role: string }|Add user|{userId: userID, status: 'ADD_USER_SUCCESSFUL' }|
|PATCH|/:userId|{ name: string, password: string, socialId: string, provider: string, role: string }|Update userInfo|{ userId: number, status: 'UPDATE_USER_SUCCESSFUL' }|
|DELETE|/:userId|empty|Delete particular user|{ userId: number, status: 'DELETE_USER_SUCCESSFUL' }|

#### *Create user example* ####
```
curl -i -X POST \
    -H "Content-Type:application/json" \
    -d '{ 
            "name": "testUser1", 
            "email": "test1@gmail.com", 
            "password": "password1", 
            "socialId": "", 
            "provider": "local"
        }' \
    http://localhost:3000/api/v1/user/ 
```

#### *Update user example* ####
```
curl -i -X PATCH \
    -H "Content-Type:application/json" \
    -D '{ 
            "name": "testUser3", 
            "email": "test3@gmail.com", 
            "password": "password3", 
            "socialId": "", 
            "provider": "local",
            "role": "admin"
        }' \
    http://localhost:3000/api/v1/user/1 
```

#### *Get particular user example* ####
```
curl -i -X GET \
    http://localhost:3000/api/v1/user/1 
```

#### *Get user list example* ####
```
curl -i -X GET \
    http://localhost:3000/api/v1/user/alluser 
```
#### *Delete user example* ####
```
curl -i -X DELETE \
    http://localhost:3000/api/v1/user/1 
```

### api/v1/user/eventjournal ###
| Method| URL| POST BODY|Description|Expected output|
|:-----|:----|:---------|:----------|:--------------|
|||||
|||||
|||||
|||||

## api/v1/questionhisotry ##
| Method| URL| POST BODY|Description|Expected output|
|:-----|:----|:---------|:----------|:--------------|
|POST|/:userId|{ questionId: number, optionId: number }|Record the option chosen by the user in the question|{ status: 'POST_HISTORY_SUCCESSFUL' }|
|GET|/:userId|empty|Get the question history of particualr user|{ status: 'GET_HISTORY_SUCCESSFUL', userId: number, history: [ { question_id: number,question_text: string, question_expired: boolean, option_id: number, option_text: string, implication: string, option_expired: boolean }] }|
|DELETE|/:userId|empty|Delete the question history of particaulr user|{ "status": "DELETE_HISTORY_SUCCESSFUL" }

#### *Record user question history example* ####
```
curl -i -X POST \
    -H "Content-Type:application/json" \
    -d '{ 
            "questionId": 1,
            "optionId": 2
        }' \
    http://localhost:3000/api/v1/user/ 
```
#### *Get user question history example* ####
```
curl -i -X GET \
    http://localhost:3000/api/v1/questionhisytory/1 
```
#### *Delete user question history example* ####
```
curl -i -X DELETE \
    http://localhost:3000/api/v1/questionhisytory/1 
```
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
|POST|/|{ question: { text: string }, options: [{ text: string, implication: string }] }|Insert new active question| { status: 'CREATE_QUESTION_SUCCESSFUL' }|
|POST|/:questionId| options: [{ text: string, implication: string }]|Insert new active question| { status: 'CREATE_OPTION_SUCCESSFUL' }|
|GET|/:questionId|empty|Get particular question|{ status: 'READ_QUESTION_SUCCESSFUL', id: number, text, expired: boolean, options: [{ id: number, text: string, implication: string, expired: boolean }] }|
|GET|/allquestion|empty|Get all question|{ status: 'READ_QUESTION_SUCCEFUL', questions: [{id: number, text, expired: boolean, options: [{ id: number, text: string, implication: string, expired: boolean }] }] }|
|PATCH|/:questionId|{question: { text: string, epxired: boolean }, options: [{ option_id: number, text: string, implication: string, expired: boolean }]|Update particular existing question| { status: 'UPDATE_QUESTION_SUCCESSFUL' } |

#### *Create question example* ####
```
curl -i -X POST \
    -H "Content-Type:application/json" \
    -d '{ 
            "question":{"text":"Do you prefer..."},
            "options":[
	            {"text":"Deep-brewed Tea","implication":"You can handle a bit of tannins (dry and astringent on your tongue). You may try more tannic wines such as Cabernet Sauvignon, Nebbiolo, Syrah..."}, 
	            {"text":"Light-brewed Tea","implication":"You’ll love smoother wines such as Merlot, Pinot Noir, Barbera, Gamay, Cabernet Franc…"},
	            {"text":"Both","implication":"You can quaff a wide spectrum of wine from low tannin to high tannin ones."}
	        ]
        }' \
    http://localhost:3000/api/v1/question/ 
```

#### *Update question example* ####
```
curl -i -X PATCH \
    -H "Content-Type:application/json" \
    -D '{ 
	        "question": {"text":"Do you prefer..."},
	        "options":[
	            {"option_id":1, "text":"Dark Chocolate","implication":"You’ve acquired the taste of bitterness to round out complexity. Perhaps old world wine is more your style."}, 
	            {"option_id":2, "text":"White Chocolate","implication":"You may enjoy more mouth-coating and round flavor. You are more inclined to new world wine."},
	            {"option_id":3, "text":"Both","implication":"New world vs old world is not much a debate for you as you may enjoy both of them."},
	        ]
        }' \
    http://localhost:3000/api/v1/question/1 
```
#### *Insert option example* ####
```
curl -i -X Post \
    -H "Content-Type:application/json" \
    -D '{
            "options":[
	            {"text":"Deep-brewed alochol","implication":"You can handle a bit of tannins (dry and astringent on your tongue). You may try more tannic wines such as Cabernet Sauvignon, Nebbiolo, Syrah..."}
	        ]
        }' \
    http://localhost:3000/api/v1/question/1 
```
#### *Get particular question example* ####
```
curl -i -X GET \
    http://localhost:3000/api/v1/question/1 
```

#### *Get all question example* ####
```
curl -i -X GET \
    http://localhost:3000/api/v1/question/allquestion 
```