const { response, request } = require('express');
const News = require('../models/news');
const Comment = require('../models/comment');
const mongoose = require('mongoose');

// Obtener todas las noticias
const getAllNews = async (req = request, res = response) => {
  try {
    const news = await News.find()
      .sort({ publishDate: -1 });
    
    // Asegúrate de que cada noticia tiene el ID correctamente transformado
    const newsWithFormattedId = news.map(item => ({
      id: item._id,
      title: item.title,
      content: item.content,
      summary: item.summary,
      image: item.image,
      author: item.author,
      authorId: item.authorId,
      publishDate: item.publishDate,
      tags: item.tags
    }));
    
    res.json(newsWithFormattedId);
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error en el servidor'
    });
  }
};

// Obtener noticias destacadas
const getFeaturedNews = async (req = request, res = response) => {
  try {
    // Por ejemplo, tomamos las 3 noticias más recientes que tengan tags
    const featuredNews = await News.find({ tags: { $exists: true, $not: { $size: 0 } } })
      .sort({ publishDate: -1 })
      .limit(3);
    
    res.json(featuredNews);
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error en el servidor'
    });
  }
};

// Obtener una noticia por ID
const getNewsById = async (req = request, res = response) => {
  const { id } = req.params;
  
  console.log(`Intentando buscar noticia con ID: "${id}"`);
  
  // Validar que el ID no sea undefined o no tenga formato válido
  if (!id || id === 'undefined') {
    console.log('ID no válido (undefined)');
    return res.status(404).json({
      msg: 'ID de noticia no válido'
    });
  }
  
  try {
    // Verificar formato de ObjectId
    const isValidObjectId = mongoose.isValidObjectId(id);
    if (!isValidObjectId) {
      console.log(`ID no tiene formato válido de ObjectId: ${id}`);
      return res.status(404).json({
        msg: 'ID de noticia no válido'
      });
    }
    
    const news = await News.findById(id);
    
    if (!news) {
      console.log(`No se encontró noticia con ID: ${id}`);
      return res.status(404).json({
        msg: 'Noticia no encontrada'
      });
    }
    
    // Asegurarnos de transformar _id a id para el frontend
    const newsWithId = {
      id: news._id.toString(),
      title: news.title,
      content: news.content,
      summary: news.summary,
      image: news.image,
      author: news.author,
      authorId: news.authorId,
      publishDate: news.publishDate,
      tags: news.tags || []
    };
    
    console.log(`Noticia encontrada con ID: ${id}`, newsWithId);
    
    res.json(newsWithId);
    
  } catch (error) {
    console.log(`Error al buscar noticia con ID: ${id}`, error);
    return res.status(500).json({
      msg: 'Error en el servidor'
    });
  }
};

// Crear una noticia
const createNews = async (req = request, res = response) => {
  const { title, content, summary, image, tags } = req.body;
  
  try {
    const news = new News({
      title,
      content,
      summary,
      image,
      author: req.user.name,
      authorId: req.user._id,
      tags: tags || []
    });
    
    await news.save();
    
    res.status(201).json(news);
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error en el servidor'
    });
  }
};

// Actualizar una noticia
const updateNews = async (req = request, res = response) => {
  const { id } = req.params;
  const { title, content, summary, image, tags } = req.body;
  
  try {
    const news = await News.findById(id);
    
    if (!news) {
      return res.status(404).json({
        msg: 'Noticia no encontrada'
      });
    }
    
    // Verificar si el usuario es el autor o es admin
    if (news.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        msg: 'No tienes permisos para editar esta noticia'
      });
    }
    
    // Actualizar campos
    if (title) news.title = title;
    if (content) news.content = content;
    if (summary) news.summary = summary;
    if (image) news.image = image;
    if (tags) news.tags = tags;
    
    await news.save();
    
    res.json(news);
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error en el servidor'
    });
  }
};

// Eliminar una noticia
const deleteNews = async (req = request, res = response) => {
  const { id } = req.params;
  
  try {
    const news = await News.findById(id);
    
    if (!news) {
      return res.status(404).json({
        msg: 'Noticia no encontrada'
      });
    }
    
    // Verificar si el usuario es el autor o es admin
    if (news.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        msg: 'No tienes permisos para eliminar esta noticia'
      });
    }
    
    // Eliminar la noticia y sus comentarios
    await Promise.all([
      News.findByIdAndDelete(id),
      Comment.deleteMany({ newsId: id })
    ]);
    
    res.json({
      msg: 'Noticia eliminada correctamente'
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error en el servidor'
    });
  }
};

// Obtener comentarios de una noticia
const getComments = async (req = request, res = response) => {
  const { newsId } = req.params;
  
  try {
    // Verificar si la noticia existe
    const newsExists = await News.findById(newsId);
    if (!newsExists) {
      return res.status(404).json({
        msg: 'Noticia no encontrada'
      });
    }
    
    // Obtener comentarios principales (sin parentId)
    const mainComments = await Comment.find({ 
      newsId,
      parentId: null
    }).sort({ date: -1 });
    
    // Para cada comentario, obtener sus respuestas
    const commentsWithReplies = await Promise.all(
      mainComments.map(async (comment) => {
        const replies = await Comment.find({ 
          parentId: comment._id 
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

// Añadir un comentario
const addComment = async (req = request, res = response) => {
  const { newsId } = req.params;
  const { content, parentId } = req.body;
  
  try {
    // Verificar si la noticia existe
    const newsExists = await News.findById(newsId);
    if (!newsExists) {
      return res.status(404).json({
        msg: 'Noticia no encontrada'
      });
    }
    
    // Si es una respuesta, verificar que el comentario padre existe
    if (parentId) {
      const parentExists = await Comment.findById(parentId);
      if (!parentExists) {
        return res.status(404).json({
          msg: 'Comentario padre no encontrado'
        });
      }
    }
    
    // Crear el comentario con la información del usuario actual
    const comment = new Comment({
      newsId,
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

// Editar un comentario
const updateComment = async (req = request, res = response) => {
  const { newsId, commentId } = req.params;
  const { content } = req.body;
  
  try {
    const comment = await Comment.findById(commentId);
    
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

// Eliminar un comentario
const deleteComment = async (req = request, res = response) => {
  const { newsId, commentId } = req.params;
  
  try {
    const comment = await Comment.findById(commentId);
    
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
      await Comment.deleteMany({ parentId: commentId });
    }
    
    // Eliminar el comentario
    await Comment.findByIdAndDelete(commentId);
    
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
};