// server/config.js

const { Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize('salesforce', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false // Set to true for debugging
});

module.exports = sequelize;
