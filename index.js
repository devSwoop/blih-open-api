const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const request = require('request')

app.use(bodyParser.json())
app.use(cors())
app.all('/*/user/:email/signature/:signature', (req, res) => {
	let method = req.method
	let body = {
		data: req.body.data || '',
		user: req.params.email,
		signature: req.params.signature
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