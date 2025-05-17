const { Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize('salesforce', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

module.exports = sequelize;
