var _ = require('underscore')
var moment = require('moment')
var Settings = require('../Settings')
var Backbone = require('backbone')
var HiveBackbone = require('../HiveBackbone/HiveBackbone')
var nano = require('nano')(Settings.CouchDB.URL)
var configDb = nano.use('config')
var SensorJarsProcessor = require('./SensorJarsProcessor')

var sensors = new HiveBackbone.Collections.Sensors()
var ev = new Backbone.Model() 
var honeyJarSettings

var newHarvestTime

// Set up the processor
ev.once('0', function(){ 
  configDb.get('HoneyJarsSettings', function(err, body) {
    if (err) {
      console.log(body);
    }
    else {
      honeyJarSettings = body
      // @todo Find the closest hour to now. We only harvest data in hour blocks, harvesting part of an hour
      // would yield strange results.
      honeyJarSettings.newHarvestTime = moment().startOf('hour').unix()
      ev.trigger('1')
    }
  })
})

// Get all of our Sensors
ev.once('1', function() {
  sensors.on('sync', function() {
    ev.trigger('2') 
  })
  sensors.fetch()
})

// Process each sensor
ev.once('2', function() {
  var sensorsIndex = 0
  var processors = []
  function go() {
    if(sensorsIndex < sensors.models.length) {
      processors[sensorsIndex] = new SensorJarsProcessor()
      processors[sensorsIndex].endkey = honeyJarSettings.newHarvestTime
      processors[sensorsIndex].startkey = honeyJarSettings.lastHarvest 
      processors[sensorsIndex].jars = [new Backbone.Model({'type': 'hourly-average-reduce', 'blockSize': 60*60})]
      processors[sensorsIndex].sensor = sensors.models[sensorsIndex]
      processors[sensorsIndex].on('done', function() {
        sensorsIndex++
        go()
      })
      processors[sensorsIndex].go()
    }
    else {
      ev.trigger('3')
    }
  }
  go()
})


// Record that we have finished harvesting
ev.once('3', function() {
  honeyJarSettings.lastHarvest = honeyJarSettings.newHarvestTime
  delete honeyJarSettings.newHarvestTime
  configDb.get('HoneyJarsSettings', honeyJarSettings, function() {
    console.log('ok')
  })
})

// Start
ev.trigger('0')

