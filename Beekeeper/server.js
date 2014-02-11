var Settings = require('../Settings')
var http = require('http')
var log = require('../util/log.js')
var express = require('express')
var httpProxy = require('http-proxy')
var tellCouchDbAboutDrives = require('./lib/TellCouchDbAboutDrives.js')
//var evaluateTriggers = require('./lib/ProcessRecipes.js')
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
log('Beekeeper', 'PortJack listening on port 80')


/*
 * Beekeeper on port 8800
 */

var ui = express()
ui.get(/^(.+)$/, function(req, res) { 
  res.sendfile(Settings.Beekeeper.path + '/attachments/' + req.params[0]) 
})
ui.listen(8800)
log('Beekeeper', 'UI listening on port 8800')


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
log('Beekeeper', 'httpProxy listening at port 8000')

/*
 * Set up some processes
 */

setTimeout(function() {
  tellCouchDbAboutDrives(function(message) {
    log("TellCouchDbAboutDrives", message)
    setInterval(function() {
      tellCouchDbAboutDrives(function(message) {
        log("TellCouchDbAboutDrives", message)
      })
    }, 1000*60*60)
  })
}, 1000*60*1)

setTimeout(function() {
  harvestHoneyJars(function(message) {
    log("HarvestHoneyJars", message)
    setInterval(function() {
      harvestHoneyJars(function(message) {
        log("HarvestHoneyJars", message)
      })
    }, 1000*60*60)
  })
}, 1000*60*1)


/*
setTimeout(function() {
   processRecipes(function() { 
    console.log(moment().format('YYYY-MM-DD HH:MM:SS') + " ProcessRecipes success")
    setInterval(function() {
      processRecipes(function() { 
        console.log(moment().format('YYYY-MM-DD HH:MM:SS') + " ProcessRecipes success")
      })
    }, 60*60*1000)
  })
}, 1000*60*1)
*/
