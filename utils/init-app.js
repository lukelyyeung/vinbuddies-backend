const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const initPassport = require('./init-passport');

// Export the function to set up the app
module.exports = (express, loginService) => {
    const app = express();
    const server = http.Server(app);
    const auth = initPassport(loginService);
    app.use(bodyParser.json());
    app.use(session({
        secret: 'supersecret'
    }));
    app.use(cors());
    app.use(auth.initialize());

    return {
        app: app,
        server: server,
        auth: auth
    }
}   