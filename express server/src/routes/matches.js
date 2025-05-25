// En routes/matches.js
const { Router } = require('express');
const { verifyJWT } = require('../middlewares/verifyJWT');
const { 
  getMatchComments,
  addMatchComment,
  updateMatchComment,
  deleteMatchComment
} = require('../controllers/matches');

const router = Router();

router.get('/:matchId/comments', getMatchComments);
router.post('/:matchId/comments', verifyJWT, addMatchComment);
router.put('/:matchId/comments/:commentId', verifyJWT, updateMatchComment);
router.delete('/:matchId/comments/:commentId', verifyJWT, deleteMatchComment);

module.exports = router;