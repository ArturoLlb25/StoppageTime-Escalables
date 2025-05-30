const { Router } = require('express');
const { 
  getLeagueStatistics,
  getAllLeagueStatistics
} = require('../controllers/statistics');

const router = Router();

router.get('/', getAllLeagueStatistics);

router.get('/:leagueId', getLeagueStatistics);

module.exports = router;