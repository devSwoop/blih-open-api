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

var tokens = {}

app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({credentials: true, origin: 'http://localhost:8080'}))
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
	res.header('Access-Control-Allow-Headers', 'origin, host, accept, X-Requested-With, content-type')
	next()
})
app.use(auth)

app.get('/login/check', (req, res) => {
	let token = req.query.token

	if (!token) 
		return res.send({ valid: false, message: 'No token' })
	jwt.verify(token, config.jwtSecret, (err, decoded) => {
		if (err)
			return res.send({ valid: false, message: 'Error while decoding' })
		res.send({ valid: true, email: decoded.email })
	})
})
app.post('/login', (req, res) => {
	let result = true

	// TODO: check if account exists
	if (req.body.email === undefined || req.body.password === undefined)
		return res.status(401).send({ message: 'Please provide an email and a password' })
	if (result === true) {
		let token = jwt.sign({
			email: req.body.email
		}, config.jwtSecret, {
			expiresIn : '12h'
		})
		tokens[req.body.email] = crypto.createHash('sha512').update(req.body.password).digest('hex')
		return res.send({ token, message: 'Successfully logged in'})
	} else {
		return res.status(401).json({
			message : 'Wrong mail/password'
		})
	}
})

app.all('/*', (req, res) => {
	let method = req.method
	let data = req.body.data || ''
	let body = {
		data: data,
		user: req.decoded.email,
		signature: crypto.createHmac('sha512', tokens[req.decoded.email]).update(req.decoded.email).update(data).digest('hex')
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