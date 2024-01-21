const Sequelize = require('sequelize');

const sequelize = require('../database');

const GroupUser = sequelize.define('GroupUser', {
	role: {
		type: Sequelize.TINYINT,
		allowNull: false,
		defaultValue: 1
	}
});

module.exports = GroupUser;
