require('dotenv').config();
const express = require('express');
const NODE_ENV = process.env.NODE_ENV || 'development';
const knexFile = require('./knexfile')[NODE_ENV];
const knex = require('knex')(knexFile);
const path = require('path');
//* Deferred Knex's foreign key constraint for transaction
require('./utils/knexDeferredForeignKey')(knex);

const {
    LoginRouter,
    UserRouter,
    QuestionRouter,
    QuestionHistoryRouter,
    UploadRouter,
    EventRouter,
    EventJournalRouter,
    WineRouter,
    TagRouter
} = require('./routers');

const {
    LoginService,
    UserService,
    QuestionService,
    QuestionHistoryService,
    UploadService,
    EventService,
    EventJournalService,
    WineService,
    TagService
} = require('./service');

const loginService = new LoginService(knex);
const userService = new UserService(knex);
const questionService = new QuestionService(knex);
const questionHistoryService = new QuestionHistoryService(knex);
const uploadService = new UploadService();
const eventService = new EventService(knex);
const eventJournalService = new EventJournalService(knex);
const wineService = new WineService(knex);
const tagService = new TagService(knex);
const { app, server, auth } = require('./utils/init-app')(express, loginService);

app.use('/static', express.static('store'));
app.use('/api/v1/auth', new LoginRouter(loginService).router());
app.use('/api/v1/user', auth.authenticate(), new UserRouter(userService).router());
app.use('/api/v1/questions', auth.authenticate(), new QuestionRouter(questionService).router())
app.use('/api/v1/questionhistory', auth.authenticate(), new QuestionHistoryRouter(questionHistoryService).router());
app.use('/api/v1/upload', auth.authenticate(), new UploadRouter(uploadService).router());
app.use('/api/v1/event', auth.authenticate(), new EventRouter(eventService).router());
app.use('/api/v1/eventjournal', auth.authenticate(), new EventJournalRouter(eventJournalService).router());
app.use('/api/v1/wine', auth.authenticate(), new WineRouter(wineService).router());
app.use('/api/v1/tags', auth.authenticate(), new TagRouter(tagService).router());
server.listen(3030, () => console.log('Listen on the port 3030.'));
