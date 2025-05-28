require('dotenv').config();
// app.js - Punto de entrada
const Server = require('./src/config/server');

const server = new Server();
server.listen();