const router = require('express').Router();

const authModule = require('../modules/auth');
const verifyAuth = require('./middleware/auth');
const User = require('../models/User');

router.post('/register', async (req, res) => {
	if(req.body.username == null || req.body.password == null) {
		res.status(400).json({
			message: 'Must provide an username and password',
			details: 'Provide an username and password in the request body'
		});
		return;
	}

	const username = req.body.username;
	const password = req.body.password;

	if(typeof username != 'string' || !authModule.validName.test(username) || username.length > 64) {
		res.status(400).json({
			message: 'Must provide an valid username',
			details: 'Username must be a string, less than 64 of length and valid chars to an username are: a-z A-Z 0-9 _ -'
		});
		return;
	}

	if(typeof password != 'string' || password.length < 4 || password.length > 128) {
		res.status(400).json({
			message: 'Must provide an valid password',
			details: 'Password must be a string and at least 4 characters of length and less than 128'
		});
		return;
	}

	const hashSalt = authModule.generateHashSalt(password);

	try {
		const user = await User.create({
			username,
			passwordHash: hashSalt.hash,
			passwordSalt: hashSalt.salt
		});

		const token = await authModule.generateToken({
			username: user.username
		});

		res.status(201).json({
			token
		});
	}catch(error) {
		if(error.name = 'SequelizeUniqueConstraintError') {
			res.status(400).json({
				message: 'Must provide an valid username',
				details: 'Username already in use'
			});
			return;
		}else {
			res.status(500).json({
				message: 'Internal error'
			});
		}
	}
});

router.post('/login', async (req, res) => {
	if(!req.body.username || !req.body.password) {
		res.status(400).json({
			message: 'Must provide an username and password',
			details: 'Provide an username and password in the request body'
		});
		return;
	}

	const username = req.body.username;
	const password = req.body.password;

	if(typeof username != 'string' || !authModule.validName.test(username) || username.length > 64) {
		res.status(400).json({
			message: 'Must provide an valid username',
			details: 'Username must be a string, less than 64 of length and valid chars to an username are: a-z A-Z 0-9 _ -'
		});
		return;
	}

	if(typeof password != 'string' || password.length < 4 || password.length > 128) {
		res.status(400).json({
			message: 'Must provide an valid password',
			details: 'Password must be a string and at least 4 characters of length and less than 128'
		});
		return;
	}

	try {
		const user = await User.findOne({
			where: {
				username
			}
		});

		if(!user) {
			res.status(400).json({
				message: 'Invalid username or password'
			});
			return;
		}

		const hash = authModule.hashPassword(password, user.passwordSalt);

		if(hash != user.passwordHash) {
			res.status(400).json({
				message: 'Invalid username or password'
			});
			return;
		}
		const token = await authModule.generateToken({
			username: user.username
		});

		res.status(201).json({
			token
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.post('/refresh', verifyAuth, async (req, res) => {
	res.status(201).json({
		token: req.newToken
	});
});

module.exports = router;
