// src/controllers/statistics.js
const { response, request } = require('express');
const axios = require('axios');
const Statistics = require('../models/statistics');
require('dotenv').config();

// Supported leagues for statistics
const SUPPORTED_LEAGUES = [
  { id: 39, name: 'Premier League', country: 'England' },
  { id: 140, name: 'La Liga', country: 'Spain' },
  { id: 78, name: 'Bundesliga', country: 'Germany' },
  { id: 135, name: 'Serie A', country: 'Italy' },
  { id: 61, name: 'Ligue 1', country: 'France' }
];

// Season to use (due to API limitations in free tier)
const SEASON = 2023;

// API configuration
const API_KEY = process.env.FOOTBALL_API_KEY;
const API_HOST = 'v3.football.api-sports.io';

// Log API key status (without exposing the full key)
console.log('API Key status:', API_KEY ? `Present (${API_KEY.substring(0, 4)}...)` : 'Missing');

// Function to fetch league standings from the API
const fetchLeagueStandings = async (leagueId, season) => {
  try {
    console.log(`Making request to API for league ${leagueId} with headers:`, {
      'x-rapidapi-key': API_KEY ? `${API_KEY.substring(0, 4)}...` : 'missing',
      'x-rapidapi-host': API_HOST
    });

    const response = await axios.get('https://v3.football.api-sports.io/standings', {
      params: {
        league: leagueId,
        season: season
      },
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      }
    });

    if (response.data.errors.length > 0) {
      console.log('API Error:', response.data.errors);
      return null;
    }

    if (response.data.response.length === 0) {
      return [];
    }

    // Extract standings from response
    const standings = response.data.response[0].league.standings[0].map(standing => ({
      rank: standing.rank,
      teamId: standing.team.id,
      teamName: standing.team.name,
      teamLogo: standing.team.logo,
      points: standing.points,
      goalsDiff: standing.goalsDiff,
      played: standing.all.played,
      win: standing.all.win,
      draw: standing.all.draw,
      lose: standing.all.lose,
      goalsFor: standing.all.goals.for,
      goalsAgainst: standing.all.goals.against
    }));

    return standings;
  } catch (error) {
    console.error(`Error fetching standings for league ${leagueId}:`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return null;
  }
};

// Function to fetch top scorers from the API
const fetchTopScorers = async (leagueId, season) => {
  try {
    const response = await axios.get('https://v3.football.api-sports.io/players/topscorers', {
      params: {
        league: leagueId,
        season: season
      },
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      }
    });

    if (response.data.errors.length > 0) {
      console.log('API Error:', response.data.errors);
      return null;
    }

    if (response.data.response.length === 0) {
      return [];
    }

    // Get top 10 scorers
    const topScorers = response.data.response.slice(0, 10).map(player => ({
      playerId: player.player.id,
      name: player.player.name,
      photo: player.player.photo,
      nationality: player.player.nationality,
      team: player.statistics[0].team.name,
      teamLogo: player.statistics[0].team.logo,
      goals: player.statistics[0].goals.total || 0,
      assists: player.statistics[0].goals.assists || 0
    }));

    return topScorers;
  } catch (error) {
    console.error(`Error fetching top scorers for league ${leagueId}:`, error.message);
    return null;
  }
};

// Function to fetch top assisters from the API
const fetchTopAssisters = async (leagueId, season) => {
  try {
    const response = await axios.get('https://v3.football.api-sports.io/players/topassists', {
      params: {
        league: leagueId,
        season: season
      },
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      }
    });

    if (response.data.errors.length > 0) {
      console.log('API Error:', response.data.errors);
      return null;
    }

    if (response.data.response.length === 0) {
      return [];
    }

    // Get top 10 assisters
    const topAssisters = response.data.response.slice(0, 10).map(player => ({
      playerId: player.player.id,
      name: player.player.name,
      photo: player.player.photo,
      nationality: player.player.nationality,
      team: player.statistics[0].team.name,
      teamLogo: player.statistics[0].team.logo,
      goals: player.statistics[0].goals.total || 0,
      assists: player.statistics[0].goals.assists || 0
    }));

    return topAssisters;
  } catch (error) {
    console.error(`Error fetching top assisters for league ${leagueId}:`, error.message);
    return null;
  }
};

// Function to update statistics for all supported leagues
const updateAllLeaguesStatistics = async () => {
  console.log('Starting to update statistics for all leagues...');
  
  // Use a counter to respect API rate limits (10 requests per minute)
  let requestCount = 0;
  const MAX_REQUESTS_PER_MINUTE = 9; // Keep one request in reserve
  
  for (const league of SUPPORTED_LEAGUES) {
    try {
      console.log(`Updating statistics for ${league.name}...`);
      
      // Check if we're approaching the rate limit
      if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
        console.log('Approaching rate limit, waiting 60 seconds...');
        await new Promise(resolve => setTimeout(resolve, 61000)); // Wait slightly over a minute
        requestCount = 0;
      }
      
      // Fetch standings
      const standings = await fetchLeagueStandings(league.id, SEASON);
      requestCount++;
      
      if (standings === null) {
        console.log(`Failed to fetch standings for ${league.name}`);
        continue;
      }
      
      // Wait to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 7000));
      
      // Fetch top scorers
      const topScorers = await fetchTopScorers(league.id, SEASON);
      requestCount++;
      
      if (topScorers === null) {
        console.log(`Failed to fetch top scorers for ${league.name}`);
        continue;
      }
      
      // Wait to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 7000));
      
      // Fetch top assisters
      const topAssisters = await fetchTopAssisters(league.id, SEASON);
      requestCount++;
      
      if (topAssisters === null) {
        console.log(`Failed to fetch top assisters for ${league.name}`);
        continue;
      }
      
      // Update or create statistics in database
      await Statistics.findOneAndUpdate(
        { leagueId: league.id, season: SEASON },
        {
          leagueId: league.id,
          leagueName: league.name,
          leagueCountry: league.country,
          leagueLogo: standings.length > 0 ? `https://media.api-sports.io/football/leagues/${league.id}.png` : '',
          season: SEASON,
          standings: standings,
          topScorers: topScorers,
          topAssisters: topAssisters,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
      
      console.log(`Successfully updated statistics for ${league.name}`);
    } catch (error) {
      console.error(`Error updating statistics for ${league.name}:`, error);
    }
  }
  
  console.log('Finished updating statistics for all leagues');
};

// API endpoint to get statistics for a specific league
const getLeagueStatistics = async (req = request, res = response) => {
  const { leagueId } = req.params;
  const season = req.query.season || SEASON;
  
  try {
    // Check if statistics exist and are recent (less than 7 days old)
    let statistics = await Statistics.findOne({ leagueId, season });
    
    // If no statistics or they are older than 7 days, try to update
    if (!statistics || Date.now() - new Date(statistics.lastUpdated).getTime() > 7 * 24 * 60 * 60 * 1000) {
      console.log(`Statistics for league ${leagueId} are outdated or missing, updating...`);
      
      // Find the league info
      const league = SUPPORTED_LEAGUES.find(l => l.id.toString() === leagueId.toString());
      if (!league) {
        return res.status(404).json({
          msg: 'League not found or not supported'
        });
      }
      
      // Try to update the statistics
      const standings = await fetchLeagueStandings(leagueId, season);
      
      if (standings === null) {
        // If update fails but we have old data, return that
        if (statistics) {
          return res.json({
            leagueId: statistics.leagueId,
            leagueName: statistics.leagueName,
            leagueCountry: statistics.leagueCountry,
            leagueLogo: statistics.leagueLogo,
            season: statistics.season,
            standings: statistics.standings,
            topScorers: statistics.topScorers,
            topAssisters: statistics.topAssisters,
            lastUpdated: statistics.lastUpdated
          });
        }
        
        return res.status(500).json({
          msg: 'Error fetching statistics from external API'
        });
      }
      
      // Wait to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 7000));
      
      // Fetch top scorers
      const topScorers = await fetchTopScorers(leagueId, season);
      
      if (topScorers === null) {
        return res.status(500).json({
          msg: 'Error fetching top scorers from external API'
        });
      }
      
      // Wait to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 7000));
      
      // Fetch top assisters
      const topAssisters = await fetchTopAssisters(leagueId, season);
      
      if (topAssisters === null) {
        return res.status(500).json({
          msg: 'Error fetching top assisters from external API'
        });
      }
      
      // Update database
      statistics = await Statistics.findOneAndUpdate(
        { leagueId, season },
        {
          leagueId,
          leagueName: league.name,
          leagueCountry: league.country,
          leagueLogo: standings.length > 0 ? `https://media.api-sports.io/football/leagues/${leagueId}.png` : '',
          season,
          standings,
          topScorers,
          topAssisters,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    }
    
    res.json({
      leagueId: statistics.leagueId,
      leagueName: statistics.leagueName,
      leagueCountry: statistics.leagueCountry,
      leagueLogo: statistics.leagueLogo,
      season: statistics.season,
      standings: statistics.standings,
      topScorers: statistics.topScorers,
      topAssisters: statistics.topAssisters,
      lastUpdated: statistics.lastUpdated
    });
    
  } catch (error) {
    console.error(`Error getting statistics for league ${leagueId}:`, error);
    res.status(500).json({
      msg: 'Error retrieving statistics'
    });
  }
};

// API endpoint to get statistics for all supported leagues
const getAllLeagueStatistics = async (req = request, res = response) => {
  const season = req.query.season || SEASON;
  
  try {
    // Get statistics for all supported leagues
    const statistics = await Statistics.find({ season });
    
    // Check if we have statistics for all leagues
    if (statistics.length < SUPPORTED_LEAGUES.length) {
      // Schedule an update for missing leagues (but don't wait for it)
      setTimeout(() => updateAllLeaguesStatistics(), 0);
    }
    
    // Return what we have
    res.json(statistics);
    
  } catch (error) {
    console.error('Error getting all statistics:', error);
    res.status(500).json({
      msg: 'Error retrieving statistics'
    });
  }
};

// Schedule weekly updates
const scheduleStatisticsUpdates = () => {
  // Check if statistics need updating when the server starts
  setTimeout(async () => {
    try {
      // Check the most recently updated statistic
      const mostRecent = await Statistics.findOne().sort({ lastUpdated: -1 });
      
      // If no statistics exist or the most recent one is older than 7 days, update all
      if (!mostRecent || Date.now() - new Date(mostRecent.lastUpdated).getTime() > 7 * 24 * 60 * 60 * 1000) {
        console.log('Statistics are outdated or missing, updating all leagues...');
        await updateAllLeaguesStatistics();
      }
    } catch (error) {
      console.error('Error checking statistics update status:', error);
    }
  }, 10000); // Wait 10 seconds after server start
  
  // Schedule weekly updates
  setInterval(async () => {
    console.log('Running scheduled weekly statistics update...');
    await updateAllLeaguesStatistics();
  }, 7 * 24 * 60 * 60 * 1000); // Every 7 days
};

module.exports = {
  getLeagueStatistics,
  getAllLeagueStatistics,
  updateAllLeaguesStatistics,
  scheduleStatisticsUpdates,
  SUPPORTED_LEAGUES,
  SEASON
};