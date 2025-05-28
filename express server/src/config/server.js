// In src/config/server.js - update to include statistics routes
const express = require('express');
const cors = require('cors');
const connectDB = require('./database');
const { scheduleMatchUpdates } = require('../controllers/matches');
const { scheduleStatisticsUpdates } = require('../controllers/statistics');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    // Rutas
    this.authPath = '/api/auth';
    this.newsPath = '/api/news';
    this.usersPath = '/api/users';
    this.matchesPath = '/api/matches';
    this.statisticsPath = '/api/statistics'; // New path for statistics

    // Middlewares
    this.app.use(cors());
    this.app.use(express.json());

    // Conexión a la base de datos
    connectDB();

    // Definir rutas
    this.routes();
    
    // Iniciar actualizaciones programadas
    scheduleMatchUpdates();
    scheduleStatisticsUpdates(); // Schedule statistics updates
  }

  routes() {
    this.app.use(this.authPath, require("../routes/auth"));
    this.app.use(this.newsPath, require("../routes/news"));
    this.app.use(this.usersPath, require("../routes/users"));
    this.app.use(this.matchesPath, require("../routes/matches"));
    this.app.use(this.statisticsPath, require("../routes/statistics")); // Add statistics routes
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en puerto ${this.port}`);
    });
  }
}

module.exports = Server;