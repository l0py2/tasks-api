const Sequelize = require('sequelize');

const sequelize = require('../database');

const Group = sequelize.define('Group', {
	id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: Sequelize.STRING(128),
		allowNull: false,
		unique: true
	},
	description: {
		type: Sequelize.TEXT
	}
});

module.exports = Group;
