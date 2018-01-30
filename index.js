const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const request = require('request')
const config = require('./config/config.js')
const auth = require('./middlewares/auth.js')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(cookieParser())
app.use(cors())
app.post('/login', (req, res) => {
	let result = true

	// TODO: check if account exists
	if (req.body.email === undefined || req.body.password === undefined)
		return res.status(401).send('Please provide an email and a password')
	if (result === true) {
		let token = jwt.sign({
			email: req.body.email,
			token: crypto.createHash('sha512').update(req.body.password).digest('hex')
		}, config.jwtSecret, {
			expiresIn : '12h'
		})
		res.cookie('x-access-token', token, {
			httpOnly : true
		})
		return res.send('Successfully logged in')
	} else {
		return res.status(401).json({
			success : false,
			message : t('Wrong mail/password')
		});
	}
})
app.get('/logout', (req, res) => {
	res.clearCookie('x-access-token').status(200).json({
		success : true,
		message : 'Disconnected'
	})
})
app.use(auth)
app.all('/*', (req, res) => {
	let method = req.method
	let data = req.body.data || ''
	let body = {
		data: data,
		user: req.decoded.email,
		signature: crypto.createHmac('sha512', req.decoded.token).update(req.decoded.email).update(data).digest('hex')
	}

	request({
                method: method,
                uri: 'https://blih.epitech.eu/' + req.params[0],
                json: body
	}, (err, response, body) => {
		res.send(response.body)
	})
})

app.listen(3000)