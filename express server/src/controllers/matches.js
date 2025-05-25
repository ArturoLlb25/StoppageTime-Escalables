// En controllers/matches.js
const MatchComment = require('../models/matchComment');
const { request, response } = require('express');

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