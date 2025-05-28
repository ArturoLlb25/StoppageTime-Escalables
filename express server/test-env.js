require('dotenv').config();
console.log('Environment variables:');
console.log('FOOTBALL_API_KEY:', process.env.FOOTBALL_API_KEY ? 'Present' : 'Missing');
console.log('Current working directory:', process.cwd()); 