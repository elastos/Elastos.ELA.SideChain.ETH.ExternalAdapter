const createRequest = require('./index').createRequest
const createBtcRequest = require('./index').createBtcRequest
const createEthRequest = require('./index').createEthRequest
const createBtcRawaddr = require('./index').createBtcRawaddr
const createEthRawaddr = require('./index').createEthRawaddr

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.EA_PORT || 8090
const rateLimit = require("express-rate-limit");


const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 5 // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

app.use(bodyParser.json())

//merge data ...
app.get('/balance', (req, res) => {
  
  createRequest(req.query, (status, result) => {

    console.log('Result: ', result)
    res.status(status).json(result)

  })
})

app.get('/balance/btc', (req, res) => {
  
  createBtcRequest(req.query.address, (status, result) => {
    console.log('Result: ', result)
    res.status(status).json(result)

  })
})

app.get('/balance/eth', (req, res) => {

  console.log(req.query.address);

  createEthRequest(req.query.address, (status, result) => {
    console.log('Result: ', result)
    res.status(status).json(result)

  })
})

//
app.get('/rawaddr/btc', (req, res) => {

  createBtcRawaddr(req.query.address, (status, result) => {
    console.log('Result: ', result)
    res.status(status).json(result)

  })
})

app.get('/rawaddr/eth', (req, res) => {
  
  createEthRawaddr(req.query.address, (status, result) => {
    console.log('Result: ', result)
    res.status(status).json(result)

  })
})




app.listen(port, () => console.log(`Listening on port ${port}!`))
