// src/routes/statistics.js
const { Router } = require('express');
const { 
  getLeagueStatistics,
  getAllLeagueStatistics
} = require('../controllers/statistics');

const router = Router();

// Get statistics for all leagues
router.get('/', getAllLeagueStatistics);

// Get statistics for a specific league
router.get('/:leagueId', getLeagueStatistics);

module.exports = router;