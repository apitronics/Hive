var Settings = require('../Settings')
var http = require('http')
var express = require('express')
var httpProxy = require('http-proxy')
var tellCouchDbAboutDisks = require('./lib/TellCouchDbAboutDrives.js')
var evaluateTriggers = require('./lib/ProcessRecipes.js')
var harvestHoneyJars = require('./lib/HarvestHoneyJars.js')
couchDb = require('nano')(Settings.CouchDB.URL)
var configDb = couchDb.db.use('config')



/*
 * Hijack port 80 for a redirect to hive.local:8000/app/ if possible else redirect to the CouchApp URL
 */

var PortJack = express()
PortJack.get(/^(.+)$/, function(req, res) { 
  res.sendfile(Settings.Beekeeper.path + '/redirect.html')
})
PortJack.listen(80)
console.log('Beekeeper\'s PortJack listening on port 80')


/*
 * Beekeeper on port 8800
 */

var ui = express()
ui.get(/^(.+)$/, function(req, res) { 
  res.sendfile(Settings.Beekeeper.path + '/attachments/' + req.params[0]) 
})
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

/*
 * Set up some processes
 */



setTimeout(function() {
  setInterval(function() {
    tellCouchDbAboutDisks()
  }, 1000*60*60)
  tellCouchDbAboutDisks()
}, 1000*60*5)



// @todo Make status and interval configurable in settings for HoneyJars, default to 1 hour interval and on for now.
//configDb.get('HoneyJarsSettings', function(err, honeyJarsSettings) {
  //if(honeyJarsSettings.status == 'on') {
setTimeout(function() {
  setInterval(function() {
    harvestHoneyJars()
  }, 1000*60*60)
  harvestHoneyJars()
}, 1000*60*5)
    //}, honeyJarsSettings.interval)
  //}
//})


setTimeout(function() {
  setInterval(function() {
    processRecipes(function() { console.log("ProcessRecipes: success")})
  }, 60*60*1000)
  processRecipes(function() { console.log("ProcessRecipes: success")})
})