var Settings = require('../Settings')
var log = require('../util/log.js')
var httpProxy = require('http-proxy')

/*
 * On port 8000 we wire everything together using httpProxy. 
 * Put the App at /app/ and redirect all other requests to CouchDB.
 */

var router = '{'
router += '"' + Settings.domain + '/queen": "127.0.0.1:125",'
router += '"' + Settings.domain + '/honeycomb":"127.0.0.1:126",'
router += '"' + Settings.domain + '/beekeeper":"127.0.0.1:8800",'
router += '"' + Settings.domain + '/*":"' + Settings.CouchDB.URL + '"'
router += '}'
var options = {
  router: JSON.parse(router)
}

httpProxy.createServer(options).listen(8000)
log('Hive Router', 'httpProxy listening at port 8000')

