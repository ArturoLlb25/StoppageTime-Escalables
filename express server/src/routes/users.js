const { Router } = require('express');
const { 
  getUserProfile, 
  updateUserProfile, 
  changePassword,
  uploadProfileImage
} = require('../controllers/users');
const { verifyJWT } = require('../middlewares/verifyJWT');

const router = Router();

// Rutas de usuarios (todas protegidas con JWT)
router.get('/profile', verifyJWT, getUserProfile);
router.put('/profile', verifyJWT, updateUserProfile);
router.put('/password', verifyJWT, changePassword);
router.post('/profile-image', verifyJWT, uploadProfileImage);

module.exports = router;
