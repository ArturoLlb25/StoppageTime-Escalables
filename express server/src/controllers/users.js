const { response, request } = require('express');
const bcrypt = require('bcrypt'); // Añade esta importación
const User = require('../models/user');

const getUserProfile = async (req = request, res = response) => {
  const userId = req.user.id;
  
  try {
    const user = await User.findById(userId);
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      role: user.role
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error en el servidor'
    });
  }
};

// Actualizar perfil del usuario
const updateUserProfile = async (req = request, res = response) => {
  const userId = req.user.id;
  const { name, email } = req.body;
  
  try {
    const user = await User.findById(userId);
    
    if (email && email !== user.email) {
      // Verificar si el nuevo email ya existe
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          msg: 'El correo ya está registrado'
        });
      }
    }
    
    // Actualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    
    await user.save();
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      role: user.role
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error en el servidor'
    });
  }
};

// Cambiar contraseña
const changePassword = async (req = request, res = response) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(userId);
    
    // Verificar la contraseña actual
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({
        msg: 'La contraseña actual no es correcta'
      });
    }
    
    // Encriptar la nueva contraseña
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(newPassword, salt);
    
    await user.save();
    
    res.json({
      msg: 'Contraseña actualizada correctamente'
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error en el servidor'
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword
};