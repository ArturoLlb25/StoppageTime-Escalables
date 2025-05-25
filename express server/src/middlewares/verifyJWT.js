const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyJWT = async (req=request, res=response, next) => {
  try {
    // Obtener el token del header de Authorization
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      return res.status(401).json({
        msg: "No hay token en la petición"
      });
    }
    
    // Verificar formato "Bearer token"
    const token = authHeader.startsWith('Bearer ') ? 
      authHeader.substring(7) : authHeader;
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    // Buscar el usuario en la BD
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        msg: "Token no válido - usuario no existe"
      });
    }
    
    // Guardar el usuario en la request
    req.user = user;
    next();
    
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      msg: "Token no válido"
    });
  }
};

module.exports = { verifyJWT };