const config = require('../config/config.js')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

module.exports = function(req, res, next) {
	if (req.path === '/login' || req.path === '/logout' || req.path === '/login/check') {
		return next()
	}

	let token = req.query.token

	if (!token) {
		return res.status(401).json({
			success: false,
			message: 'Failed to authenticate token.'
		})
	}
	jwt.verify(token, config.jwtSecret, (err, decoded) => {
		if (err) {
			return res.status(401).json({
				success: false,
				message: 'Failed to authenticate token.' + err
			})
		} else {
			req.decoded = decoded
			req.toto = 'MAIS PUTAIN'
			next()
		}
	})
}