const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  next()
})
app.use(cors())
const http = require('http').createServer(app)

const PORT = process.env.PORT || 8080
app.use(cors())
app.use(express.json())

app.listen(PORT, () => {
  console.log('App listening on ' + PORT)
})
http.listen(4000, function () {
  console.log('listening on port 4000')
})

app.get('/', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.send('hello world')
})

mongoose.connect(process.env.MONGO_URI, (err) => {
  if (!err) {
    console.log('mongoDB connected successfully to ' + process.env.MONGO_URI)
  } else {
    console.error(err)
  }
})
const routes = require('./routes')
app.use(routes)
