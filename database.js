const Sequelize = require('sequelize');

const config = require('./config');

const sequelize = new Sequelize(
	process.env.DATABASE_NAME,
	process.env.DATABASE_USER,
	process.env.DATABASE_USER_PASSWORD,
	{
		dialect: 'mariadb',
		host: process.env.DATABASE_HOST,
		define: {
			charset: config.database.charset
		},
		logging: config.database.logging
	}
);

module.exports = sequelize;
