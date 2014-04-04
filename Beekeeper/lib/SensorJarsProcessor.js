/*
 * This module processes a Sensor's Jars given a range
 */

var moment = require('moment')
var Settings = require('../../Settings')
var nano = require('nano')(Settings.CouchDB.URL)
var _ = require('underscore')
var Backbone = require('backbone')
var HiveBackbone = require('../../HiveBackbone/HiveBackbone')

module.exports =  Backbone.Model.extend({

  //
  // public vars
  //

  // The Sensor this module will process Jars for
  sensor: null,
  // The time where to start processing data for the Sensor given
  startkey: null,
  // The time where to end processing data for the Sensor given
  endkey: null,
  // The types of Jars we'll be processing for this Sensor
  jars: [],

  //
  // public functions
  //

  go: function() {

    this._readings = new HiveBackbone.Collections.Readings()
    this._points = []
    this._jarsIndex = 0
    this._jarContents = []

    this.on('run:done', function() {
      this.trigger('done')
    }, this)
    this.run()
  },

  //
  // private vars
  //

  // This Collection is what we'll use to get the range of data for sensor defined in public vars
  _readings: new HiveBackbone.Collections.Readings(),
  // The stripped down set of data from this._readings as [[x, y], ...]
  _points: [],
  // The index in this.jars of the current Jar being processed
  _jarsIndex: 0,
  // The place we'll put the results of processing a Jar
  _jarContents: [],

  //
  // Private functions
  //

  // Event manager
  run: function() {

    // Process the first Jar in this.jars for this.sensor,
    // save this._points, continue to the next jar, save this._points,
    // and on and on...

    var processor = this

    processor.on('saveJar:done', function() {
      processor._jarsIndex++
      if (processor.jarsIndex < processor.jars.length) {
        processor.processJar()
      }
      else {
        processor.trigger('run:done')
      }
    })

    processor.on('processJar:done', function() {
      processor.saveJar()
    })

    processor.on('prepare:done', function() {
      processor.processJar()
    })

    // Go
    processor.prepare()

  },

  // Fetches Reading models into this._readings according to params set
  // (startkey, endkey, sensor) and then compiles those Reading models
  // into this._points to make them easier to do calculations on.
  prepare: function() {
    var processor = this
    // get all data for this sensor from the last time we harvested
    processor._readings.params.startkey = processor.startkey
    processor._readings.params.endkey = processor.endkey
    processor._readings.params.sensor = processor.sensor
    processor._readings.on('sync', function() {
      // transform into [[x, y], ...]
      processor._points = []
      processor._readings.each(function(reading) {
        processor._points.push([parseInt(reading.get('_id')), reading.get('d') ])
      })
      // Remove from memory because why not
      delete processor._readings
      processor.trigger('prepare:done')
    })
    processor._readings.fetch()
  },

  // Reduce this.points given the jar
  processJar: function() {
    var jar = this.jars[this._jarsIndex]
    // @todo - right now our reduce is just one kind. We'll want other kinds of reduce in the future,
    // particularly for sensors that have different kind of data than just temperature.
    //var Reduce = require('./reduce_modules/' +  jar.get('type'))
    var Reduce = require('./HourlyAverageReduce')
    this._jarContents = new Reduce(this._points)
    this.trigger('processJar:done')
  },

  saveJar: function() {
    var processor = this
    var jar = this.jars[this._jarsIndex]
    var dbName = processor.sensor.dbName() + '__reduced__' + jar.get('type')
    // Guarantee the database exists by trying to create it everytime, no one worries if it fails
    nano.db.create(dbName, function(err, body) {
      var db = nano.db.use(dbName)
      db.bulk({docs: processor._jarContents}, function(err, body) {
        if(!err) {
          processor.trigger('saveJar:done')
        }
        else {
          console.log('SensorsJarsProcessor: Failed to save Jar')
        }
      })
    })
  },


})


