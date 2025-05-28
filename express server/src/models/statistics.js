// src/models/statistics.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerStatSchema = new Schema({
  playerId: Number,
  name: String,
  photo: String,
  nationality: String,
  team: String,
  teamLogo: String,
  goals: Number,
  assists: Number
});

const leagueStandingSchema = new Schema({
  rank: Number,
  teamId: Number,
  teamName: String,
  teamLogo: String,
  points: Number,
  goalsDiff: Number,
  played: Number,
  win: Number,
  draw: Number,
  lose: Number,
  goalsFor: Number,
  goalsAgainst: Number
});

const statisticsSchema = new Schema({
  leagueId: {
    type: Number,
    required: true
  },
  leagueName: {
    type: String,
    required: true
  },
  leagueCountry: {
    type: String,
    required: true
  },
  leagueLogo: String,
  season: {
    type: Number,
    required: true
  },
  standings: [leagueStandingSchema],
  topScorers: [playerStatSchema],
  topAssisters: [playerStatSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
statisticsSchema.index({ leagueId: 1, season: 1 }, { unique: true });

module.exports = mongoose.model('Statistics', statisticsSchema);