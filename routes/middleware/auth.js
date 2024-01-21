const authModule = require('../../modules/auth');
const User = require('../../models/User');

const attributes = {
	exclude: ['passwordHash', 'passwordSalt']
};

const verifyAuth = async (req, res, next) => {
	const header = req.get('Authorization');

	if(!header) {
		res.status(401).json({
			message: 'You need to provide an Authorization header',
			details: 'Provide an Authorization header in the request'
		});
		return;
	}

	if(header.indexOf('Bearer ') != 0) {
		res.status(400).json({
			message: 'You need to provide an valid Authorization header',
			details: 'Authorization needs to be in this format: Bearer [token]'
		});
		return;
	}

	const token = header.slice(7);
	const payload = await authModule.extractToken(token);

	if(!payload) {
		res.status(400).json({
			message: 'You need to provide an valid token',
			details: 'Token needs to be an valid JWT token'
		});
		return;
	}

	const user = await User.findOne({
		where: {
			username: payload.username
		},
		attributes
	});

	if(!user) {
		res.status(400).json({
			message: 'You need to provide an valid token',
			details: 'Get a new JWT token'
		});
		return;
	}

	req.newToken = await authModule.generateToken(payload);

	req.user = user;

	next();
}

module.exports = verifyAuth;
