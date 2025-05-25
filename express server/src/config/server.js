const express = require('express');
const cors = require('cors');
const connectDB = require('./database');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    // Rutas
    this.authPath = '/api/auth';
    this.newsPath = '/api/news';
    this.usersPath = '/api/users';

    // Middlewares
    this.app.use(cors());
    this.app.use(express.json());

    // Conexión a la base de datos
    connectDB();

    // Definir rutas
    this.routes();
  }

  routes() {
    this.app.use(this.authPath, require('../routes/auth'));
    this.app.use(this.newsPath, require('../routes/news'));
    this.app.use(this.usersPath, require('../routes/users'));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en puerto ${this.port}`);
    });
  }
}

module.exports = Server;