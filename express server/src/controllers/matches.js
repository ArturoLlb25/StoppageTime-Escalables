// En controllers/matches.js
// En controllers/matches.js
const { request, response } = require('express');
const MatchComment = require('../models/matchComments');

// Obtener comentarios de un partido
const getMatchComments = async (req = request, res = response) => {
  const { matchId } = req.params;
  
  try {
    // Obtener comentarios principales (sin parentId)
    const mainComments = await MatchComment.find({ 
      matchId,
      parentId: null
    }).sort({ date: -1 });
    
    // Para cada comentario, obtener sus respuestas
    const commentsWithReplies = await Promise.all(
      mainComments.map(async (comment) => {
        const replies = await MatchComment.find({ 
          parentId: comment._id.toString()
        }).sort({ date: 1 });
        
        return {
          ...comment.toObject(),
          replies
        };
      })
    );
    
    res.json(commentsWithReplies);
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error en el servidor'
    });
  }
};

// Añadir un comentario a un partido
const addMatchComment = async (req = request, res = response) => {
  const { matchId } = req.params;
  const { content, parentId } = req.body;
  
  try {
    // Crear el comentario
    const comment = new MatchComment({
      matchId,
      userId: req.user._id,
      userName: req.user.name,
      userImage: req.user.profilePicture || '',
      content,
      parentId: parentId || null
    });
    
    await comment.save();
    
    res.status(201).json(comment);
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error en el servidor'
    });
  }
};

// Editar un comentario de un partido
const updateMatchComment = async (req = request, res = response) => {
  const { matchId, commentId } = req.params;
  const { content } = req.body;
  
  try {
    const comment = await MatchComment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        msg: 'Comentario no encontrado'
      });
    }
    
    // Verificar si el usuario es el autor del comentario
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        msg: 'No tienes permisos para editar este comentario'
      });
    }
    
    // Actualizar el contenido
    comment.content = content;
    await comment.save();
    
    res.json(comment);
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error en el servidor'
    });
  }
};

// Eliminar un comentario de un partido
const deleteMatchComment = async (req = request, res = response) => {
  const { matchId, commentId } = req.params;
  
  try {
    const comment = await MatchComment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        msg: 'Comentario no encontrado'
      });
    }
    
    // Verificar si el usuario es el autor del comentario o es admin
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        msg: 'No tienes permisos para eliminar este comentario'
      });
    }
    
    // Si es un comentario principal, eliminar también sus respuestas
    if (!comment.parentId) {
      await MatchComment.deleteMany({ parentId: commentId });
    }
    
    // Eliminar el comentario
    await MatchComment.findByIdAndDelete(commentId);
    
    res.json({
      msg: 'Comentario eliminado correctamente'
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error en el servidor'
    });
  }
};

module.exports = {
  getMatchComments,
  addMatchComment,
  updateMatchComment,
  deleteMatchComment
};
