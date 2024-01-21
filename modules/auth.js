/*
 * Collection of functions to help with auth
 */

const crypto = require('crypto');
const jose = require('jose');

const config = require('../config');

const validName = /^[a-z0-9_-]+$/;
const tokenSecret = new TextEncoder().encode(process.env.TOKEN_SECRET);
const tokenAlg = config.token.alg;
const tokenExpiration = config.token.expiration;

const attributes = {
	exclude: ['passwordHash', 'passwordSalt']
};

function hashPassword(password, salt) {
	return crypto.pbkdf2Sync(
		password,
		salt,
		100000,
		64,
		'sha512'
	).toString('hex');
}

function generateHashSalt(password) {
	const salt = crypto.randomBytes(32).toString('hex');
	const hash = hashPassword(password, salt);

	return {
		hash,
		salt
	};
}

async function generateToken(payload) {
	try {
		const token = await new jose.SignJWT(payload)
			.setProtectedHeader({ alg: tokenAlg })
			.setExpirationTime(tokenExpiration)
			.sign(tokenSecret)

		return token;
	}catch(error) {
		return null;
	}
}

async function extractToken(token) {
	try {
		const { payload, protectedHeader } = await jose.jwtVerify(token, tokenSecret);

		return payload;
	}catch(error) {
		return null;
	}
}

module.exports = {
	validName,
	hashPassword,
	generateHashSalt,
	generateToken,
	extractToken,
	attributes
};
