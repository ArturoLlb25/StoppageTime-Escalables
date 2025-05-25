// En middlewares/verifyAdminRole.js
const { response, request } = require('express');

const verifyAdminRole = (req = request, res = response, next) => {
  // Verificar que existe req.user (se debió ejecutar verifyJWT antes)
  if (!req.user) {
    return res.status(500).json({
      msg: 'Se requiere verificar el token primero'
    });
  }

  const { role, name } = req.user;
  
  if (role !== 'admin') {
    return res.status(403).json({
      msg: `${name} no tiene permisos de administrador`
    });
  }

  next();
};

module.exports = { verifyAdminRole };