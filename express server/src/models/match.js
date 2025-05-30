const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchSchema = new Schema({
  apiId: {
    type: Number,
    required: true,
    unique: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'LIVE', 'FINISHED', 'CANCELED'],
    required: true
  },
  round: {
    type: String
  },
  league: {
    id: Number,
    name: String,
    logo: String,
    country: String
  },
  homeTeam: {
    id: Number,
    name: String,
    logo: String
  },
  awayTeam: {
    id: Number,
    name: String,
    logo: String
  },
  score: {
    home: Number,
    away: Number,
    halftime: {
      home: Number,
      away: Number
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Índice compuesto para consultas eficientes por fecha
matchSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Match', matchSchema);