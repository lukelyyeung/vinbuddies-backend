const dotenv = require('dotenv');
dotenv.config({ path: '../.env' })
const publicKey = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');
const privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');

module.exports = {
    privateKey: privateKey,
    publicKey: publicKey,
    // jwtSecret: "jsakdlfljadsmview12",
    jwtSession: {
        session: false
    },
    jwtAlgorithm: "RS256"
}