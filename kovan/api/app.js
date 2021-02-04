//
const watchBtcBalanceChainRequest  = require('./index').watchBtcBalanceChainRequest
const watchBtcTimespanChainRequest = require('./index').watchBtcTimespanChainRequest
const watchBtcScoreChainRequest  = require('./index').watchBtcScoreChainRequest

const watchEthBalanceChainRequest  = require('./index').watchEthBalanceChainRequest
const watchEthTimespanChainRequest = require('./index').watchEthTimespanChainRequest
const watchEthScoreChainRequest  = require('./index').watchEthScoreChainRequest

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.EA_PORT || 8089

app.use(bodyParser.json())


app.get('/chain/watch/btcBalance', (req, res) => {

  watchBtcBalanceChainRequest((status, result) => {
    
    console.log('Result: ', result)
    res.status(status).json(result)
  
  })
})

app.get('/chain/watch/btcTimespan', (req, res) => {

  watchBtcTimespanChainRequest((status, result) => {
    
    console.log('Result: ', result)
    res.status(status).json(result)
  
  })
})


app.get('/chain/watch/ethBalance', (req, res) => {

  watchEthBalanceChainRequest((status, result) => {
    
    console.log('Result: ', result)
    res.status(status).json(result)
  
  })
})

app.get('/chain/watch/ethTimespan', (req, res) => {

  watchEthTimespanChainRequest((status, result) => {
    
    console.log('Result: ', result)
    res.status(status).json(result)
  
  })
})

//add btc score
app.get('/chain/watch/btcScore', (req, res) => {

  watchBtcScoreChainRequest(req.query.address,(status, result) => {
    
    console.log('Result: ', result)
    res.status(status).json(result)
  
  })
})

//add eth score
app.get('/chain/watch/ethScore', (req, res) => {

  watchEthScoreChainRequest(req.query.address,(status, result) => {
    
    console.log('Result: ', result)
    res.status(status).json(result)
  
  })
})



app.listen(port, () => console.log(`Listening on port ${port}!`))
