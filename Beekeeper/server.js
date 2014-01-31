var http = require('http')
var express = require('express')
var httpProxy = require('http-proxy')
var Settings = require('../Settings')


/*
 * Hijack port 80 for a redirect to hive.local:8000/app/ if possible else redirect to the CouchApp URL
 */

var PortJack = express()
PortJack.get(/^(.+)$/, function(req, res) { res.sendfile('./redirect.html'); })
PortJack.listen(80)
console.log('Beekeeper\'s PortJack listening on port 80')


/*
 * Beekeeper on port 8800
 */

var ui = express()
ui.get(/^(.+)$/, function(req, res) { res.sendfile('./attachments/' + req.params[0]); })
ui.listen(8800)
console.log('Beekeeper\' UI listening on port 8800')


/*
 * On port 8000 we wire everything together using httpProxy. 
 * Put the App at /app/ and redirect all other requests to CouchDB.
 */

var options = {
  router: {
    'hive.local/beekeeper': '127.0.0.1:8800', // -> Beekeeper UI
    'hive.local/*': Settings.CouchDB.URL, // -> CouchDB
  }
}

httpProxy.createServer(options).listen(8000)
console.log('Beekeeper\'s httpProxy listening at port 8000')
