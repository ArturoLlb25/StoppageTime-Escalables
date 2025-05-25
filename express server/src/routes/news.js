const { Router } = require('express');
const { 
  getAllNews,
  getFeaturedNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getComments,
  addComment,
  updateComment,
  deleteComment
} = require('../controllers/news');
const { verifyJWT } = require('../middlewares/verifyJWT');
const { verifyAdminRole } = require('../middlewares/verifyAdminRole');

const router = Router();

// Rutas públicas
router.get('/', getAllNews);
router.get('/featured', getFeaturedNews);
router.get('/:id', getNewsById);
router.get('/:newsId/comments', getComments);

// Rutas protegidas (requieren autenticación)
router.post('/', [verifyJWT], createNews);
router.put('/:id', [verifyJWT], updateNews);
router.delete('/:id', [verifyJWT], deleteNews);
router.post('/:newsId/comments', [verifyJWT], addComment);
router.put('/:newsId/comments/:commentId', [verifyJWT], updateComment);
router.delete('/:newsId/comments/:commentId', [verifyJWT], deleteComment);

module.exports = router;