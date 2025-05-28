// En src/controllers/matches.js (modificar el existente)
const { response, request } = require('express');
const axios = require('axios');
const Match = require('../models/match');
const MatchComment = require('../models/matchComments');

// Función para obtener partidos de la API y guardarlos en la BD
const fetchAndUpdateMatches = async () => {
  try {
    // Verificar si ya se actualizó hoy
    const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Buscar el partido más reciente para verificar si ya se actualizó hoy
    const lastUpdated = await Match.findOne().sort({ lastUpdated: -1 });
    
    // Si se actualizó hoy, no hacemos nada
    if (lastUpdated && new Date(lastUpdated.lastUpdated).toISOString().split('T')[0] === today) {
      console.log('Los partidos ya fueron actualizados hoy');
      return;
    }
    
    console.log('Actualizando partidos desde la API...');
    
    // Configuración para la API
    const options = {
      method: 'GET',
      url: 'https://v3.football.api-sports.io/fixtures',
      params: { date: today },
      headers: {
        'x-rapidapi-key': process.env.FOOTBALL_API_KEY || '9f63c4bbf4881cd6893190661c9beb88',
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    };
    
    const response = await axios.request(options);
    
    if (response.data && response.data.response) {
      const fixtures = response.data.response;
      
      // Limitar a 20 partidos para evitar sobrecarga
      const limitedFixtures = fixtures.slice(0, 20);
      
      for (const fixture of limitedFixtures) {
        // Mapear datos de la API a nuestro modelo
        const matchData = {
          apiId: fixture.fixture.id,
          date: fixture.fixture.date.split('T')[0],
          time: fixture.fixture.date.split('T')[1].substring(0, 5),
          status: mapApiStatus(fixture.fixture.status.short),
          round: fixture.league.round,
          league: {
            id: fixture.league.id,
            name: fixture.league.name,
            logo: fixture.league.logo,
            country: fixture.league.country
          },
          homeTeam: {
            id: fixture.teams.home.id,
            name: fixture.teams.home.name,
            logo: fixture.teams.home.logo
          },
          awayTeam: {
            id: fixture.teams.away.id,
            name: fixture.teams.away.name,
            logo: fixture.teams.away.logo
          },
          score: {
            home: fixture.goals.home,
            away: fixture.goals.away,
            halftime: {
              home: fixture.score.halftime?.home || null,
              away: fixture.score.halftime?.away || null
            }
          },
          lastUpdated: new Date()
        };
        
        // Usar upsert para actualizar si existe o crear si no
        await Match.findOneAndUpdate(
          { apiId: matchData.apiId }, 
          matchData, 
          { upsert: true, new: true }
        );
      }
      
      console.log(`Actualizados ${limitedFixtures.length} partidos en la base de datos`);
    }
  } catch (error) {
    console.error('Error al obtener datos de la API de fútbol:', error.message);
  }
};

// Mapear estados de la API a nuestro modelo
const mapApiStatus = (apiStatus) => {
  const statusMap = {
    'NS': 'SCHEDULED', // Not Started
    'TBD': 'SCHEDULED', // To Be Defined
    '1H': 'LIVE',      // First Half
    'HT': 'LIVE',      // Half Time
    '2H': 'LIVE',      // Second Half
    'ET': 'LIVE',      // Extra Time
    'P': 'LIVE',       // Penalty
    'FT': 'FINISHED',  // Match Finished
    'AET': 'FINISHED', // Match Finished After Extra Time
    'PEN': 'FINISHED', // Match Finished After Penalties
    'SUSP': 'CANCELED', // Match Suspended
    'INT': 'CANCELED', // Match Interrupted
    'PST': 'CANCELED', // Match Postponed
    'CANC': 'CANCELED', // Match Cancelled
    'ABD': 'CANCELED', // Match Abandoned
    'AWD': 'FINISHED', // Technical Loss
    'WO': 'FINISHED'   // Walkover
  };
  
  return statusMap[apiStatus] || 'SCHEDULED';
};

// Obtener todos los partidos
const getMatches = async (req = request, res = response) => {
  try {
    // Asegurarse de que los datos estén actualizados
    await fetchAndUpdateMatches();
    
    // Obtener todos los partidos para hoy
    const today = new Date().toISOString().split('T')[0];
    const matches = await Match.find({ date: today }).sort({ 'score.home': -1, 'time': 1 });
    
    // Transformar a formato esperado por el frontend
    const formattedMatches = matches.map(match => ({
      id: match.apiId,
      date: match.date,
      time: match.time,
      status: match.status,
      round: match.round,
      league: match.league,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      score: match.score
    }));
    
    res.json(formattedMatches);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error al obtener partidos'
    });
  }
};

// Obtener un partido específico
const getMatchById = async (req = request, res = response) => {
  const { id } = req.params;
  
  try {
    const match = await Match.findOne({ apiId: id });
    
    if (!match) {
      return res.status(404).json({
        msg: 'Partido no encontrado'
      });
    }
    
    res.json({
      id: match.apiId,
      date: match.date,
      time: match.time,
      status: match.status,
      round: match.round,
      league: match.league,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      score: match.score
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Error al obtener el partido'
    });
  }
};

// Mantener los métodos existentes para comentarios
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

// Agregar el programador de tareas para actualizar partidos automáticamente
const scheduleMatchUpdates = () => {
  // Actualizar al iniciar el servidor
  fetchAndUpdateMatches();
  
  // Programar actualizaciones diarias (a medianoche)
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // mañana
    0, 0, 0 // 00:00:00
  );
  
  const timeUntilMidnight = midnight.getTime() - now.getTime();
  
  // Programar la primera actualización a medianoche
  setTimeout(() => {
    fetchAndUpdateMatches();
    
    // Después, programar actualizaciones diarias
    setInterval(fetchAndUpdateMatches, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
  
  console.log(`Actualización de partidos programada para iniciar en ${Math.floor(timeUntilMidnight / 60000)} minutos`);
};

module.exports = {
  getMatches,
  getMatchById,
  getMatchComments,
  addMatchComment,
  updateMatchComment,
  deleteMatchComment,
  scheduleMatchUpdates
};