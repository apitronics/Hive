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
ev.once('0', function() {
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

ev.once('1', function() {
  honeyJarSettings.lastHarvest = honeyJarSettings.newHarvestTime
  delete honeyJarSettings.newHarvestTime
  configDb.insert(honeyJarSettings, 'HoneyJarsSettings', function(err, body) {
    console.log('ok')
  })
})

// Start
ev.trigger('0')

