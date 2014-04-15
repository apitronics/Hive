var Settings = require('../Settings')
var log = require('../util/log.js')
var express = require('express')
var tellCouchDbAboutDrives = require('./lib/TellCouchDbAboutDrives.js')
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
 * Set up some processes, staggered
 */

setTimeout(function() {
  log("TellCouchDbAboutDrives", "starting")
  tellCouchDbAboutDrives(function(err, message) {
    if (err) log("TellCouchDbAboutDrives", err)
    if (message) log("TellCouchDbAboutDrives", message)
    setInterval(function() {
      log("TellCouchDbAboutDrives", "starting")
      tellCouchDbAboutDrives(function(err, message) {
        if (err) log("TellCouchDbAboutDrives", err)
        if (message) log("TellCouchDbAboutDrives", message)
      })
    }, Settings.tellCouchDbAboutDrivesFrequencyInMinutes*60*1000)
  })
}, 1000*5*1)

setTimeout(function() {
  log("HarvestHoneyJars", "starting")
  harvestHoneyJars(function(err, message) {
    if (message) log("HarvestHoneyJars", message)
    if (err) log("HarvestHoneyJars", err)
    setInterval(function() {
      log("HarvestHoneyJars", "starting")
      harvestHoneyJars(function(err, message) {
        if (message) log("HarvestHoneyJars", message)
        if (err) log("HarvestHoneyJars", err)
      })
    }, Settings.harvestHoneyJarsFrequencyInMinutes*60*1000)
  })
}, 1000*20*3)

