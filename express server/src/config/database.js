const mongoose = require('mongoose');

const connectDB = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'stoppage_time_db'
  })
  .then(() => {
    console.log('MongoDB conectado correctamente');
  })
  .catch(error => {
    console.log('Error al conectar con MongoDB');
    console.log(error);
  });
};

module.exports = connectDB;