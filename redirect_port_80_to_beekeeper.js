// Running this service will create a redirect on Port 80 to the Beekeeper UI

var Settings = require('./Settings')
var log = require('./util/log.js')
var express = require('express')

var PortJack = express()
PortJack.get(/^(.+)$/, function(req, res) { 
  res.sendfile(Settings.path + '/redirect_port_80_to_beekeeper.html')
})
PortJack.listen(80)
log('Redirect', 'Redirect listening on port 80')

