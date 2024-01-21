const Sequelize = require('sequelize');

const sequelize = require('../database');

const Task = sequelize.define('Task', {
	id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: Sequelize.STRING(128),
		allowNull: false
	},
	description: {
		type: Sequelize.TEXT
	},
	status: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	start: {
		type: Sequelize.DATE,
		allowNull: false
	},
	end: {
		type: Sequelize.DATE,
		allowNull: false
	}
});

module.exports = Task;
