const Sequelize = require('sequelize');

const sequelize = require('../database');

const TaskUser = sequelize.define('TaskUser', {});

module.exports = TaskUser;
