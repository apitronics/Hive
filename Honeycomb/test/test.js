var express = require('express');
var _ = require('underscore')
var Backbone = require('backbone')
var HiveBackbone = require('../HiveBackbone/HiveBackbone')
var honeyPacketProcessor = require('./HoneyPacketProcessor')
var server = express();

server.use(express.bodyParser())

server.put('/*', function(req, res){
  res.send('')
  var data = JSON.parse(_.keys(req.body)[0])
  console.log(data)
})

server.listen(3000);
console.log('Honeycomb server listening on port 3000');
