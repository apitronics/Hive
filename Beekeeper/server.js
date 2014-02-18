var Settings = require('../Settings')
var log = require('../util/log.js')
var express = require('express')
var tellCouchDbAboutDrives = require('./lib/TellCouchDbAboutDrives.js')
//var evaluateTriggers = require('./lib/ProcessRecipes.js')
var harvestHoneyJars = require('./lib/HarvestHoneyJars.js')


/*
 * Beekeeper UI on port 8800
 */

var ui = express()
ui.get(/^(.+)$/, function(req, res) { 
  res.sendfile(Settings.Beekeeper.path + '/attachments/' + req.params[0]) 
})
ui.listen(8800)
log('Beekeeper', 'UI listening on port 8800')


/*
 * Set up some processes
 */

setTimeout(function() {
  log("TellCouchDbAboutDrives", "starting")
  tellCouchDbAboutDrives(function(err, message) {
    log("TellCouchDbAboutDrives", message)
    setInterval(function() {
      log("TellCouchDbAboutDrives", "starting")
      tellCouchDbAboutDrives(function(err, message) {
        log("TellCouchDbAboutDrives", message)
      })
    }, 1000*60*60)
  })
}, 1000*60*1)

setTimeout(function() {
  log("HarvestHoneyJars", "starting")
  harvestHoneyJars(function(err, message) {
    log("HarvestHoneyJars", message)
    setInterval(function() {
      log("HarvestHoneyJars", "starting")
      harvestHoneyJars(function(err, message) {
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
