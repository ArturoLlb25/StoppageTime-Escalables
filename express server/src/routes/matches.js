const { Router } = require('express');
const { verifyJWT } = require('../middlewares/verifyJWT');
const { 
  getMatches,
  getMatchById,
  getMatchComments,
  addMatchComment,
  updateMatchComment,
  deleteMatchComment
} = require('../controllers/matches');

const router = Router();

// Ruta para obtener todos los partidos
router.get('/', getMatches);

// Ruta para obtener un partido específico
router.get('/:id', getMatchById);

// Rutas de comentarios
router.get('/:matchId/comments', getMatchComments);
router.post('/:matchId/comments', verifyJWT, addMatchComment);
router.put('/:matchId/comments/:commentId', verifyJWT, updateMatchComment);
router.delete('/:matchId/comments/:commentId', verifyJWT, deleteMatchComment);

module.exports = router;