const Sequelize = require('sequelize');

const sequelize = require('../database');

const User = sequelize.define('User', {
	id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	username: {
		type: Sequelize.STRING(64),
		allowNull: false,
		unique: true
	},
	passwordHash: {
		type: Sequelize.STRING,
		allowNull: false
	},
	passwordSalt: {
		type: Sequelize.STRING,
		allowNull: false
	}
});

module.exports = User;
