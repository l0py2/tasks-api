module.exports = {
	database: {
		charset: 'utf16',
		logging: false,
		sync: {
			force: true
		}
	},
	token: {
		alg: 'HS256',
		expiration: '168h'
	},
	app: {
		port: 3000
	}
};
