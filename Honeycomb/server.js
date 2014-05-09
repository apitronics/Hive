var express = require('express')
var log = require('../util/log.js')
var _ = require('underscore')
var Backbone = require('backbone')
var HiveBackbone = require('../HiveBackbone/HiveBackbone')
var honeyPacketProcessor = require('./lib/HoneyPacketProcessor')
var processRecipes = require('./lib/ProcessRecipes.js');
var server = express();

server.use(express.bodyParser())

server.post('/*', function(req, res){
  // Respond
  res.send('ok')
  var data = req.body
  // Event dispatcher for this process
  var ev = new Backbone.Model

  // Set up our Collections
  var bee = new HiveBackbone.Models.Bee()
	var bees = new HiveBackbone.Collections.BeesByAddress()
  var sensors = new HiveBackbone.Collections.SensorsByBeeId()
  //var sensorDefinitions = new HiveBackbone.Collections.SensorDefinitionsByFirmwareUUID()
  var sensorDefinitions = new HiveBackbone.Collections.SensorDefinitions()
  var readings = new HiveBackbone.Collections.Readings()

  // Look up the Bee that has this address
  ev.on('go:0', function() {
    bees.params.beeAddress = data.address
    bees.on('sync', function() {
      bee = bees.models[0];
      if(!!bee) {
        ev.trigger('go:1');
      } else {
        log('Bee not found for address', data.address);
      }
    })
    bees.fetch()
  })

  // Look up the Sensor Docs whose bee property is bee.id
  ev.on('go:1', function() {
    sensors.params.beeId = bee.id
    sensors.on('sync', function() {
      ev.trigger('go:2')
    })
    sensors.fetch()
  })

  // Get all SensorDefinitions
  ev.on('go:2', function() {
    // Collect the Firmware UUIDs we need
    //
    // @todo Get only relevant SensorDefinitions, SensorDefinition.firmwareUUID and and Sensor.
    // sensorDefinitionFirmwareUUID aren't going to match up in a Couch View becuase they are different strings.
    // Instead we'll get ALL SensorDefinitions, do some text tranformations to Integers and match them in code
    // in the HoneyPacketProcessor.
    /*
    _.each(sensors.models, function(sensor) {
      console.log(sensor)

      if(_.indexOf(sensorDefinitions.params.sensorDefinitionFirmwareUUIDs, sensor.get('sensorDefinitionFirmwareUUID')) == -1) {
        sensorDefinitions.params.sensorDefinitionFirmwareUUIDs.push(sensor.get('sensorDefinitionFirmwareUUID'))
      }
    })
    */
    sensorDefinitions.on('sync', function() {
      ev.trigger('go:3')
    })
    sensorDefinitions.fetch()
  })


  // Run each Honey Packet in data through the honeyPacketProcessor
  ev.on('go:3', function() {
    _.each(data.data, function(packet, dateTime, list) {
      readings.add(honeyPacketProcessor(dateTime, packet, sensors, sensorDefinitions))
    })
    ev.trigger('go:4')
  })

  // Save readings
  ev.on('go:4', function() {
    readings.once('sync', function() {
      ev.trigger('go:5');
    });
    readings.save();
  });

  // Process recipes
  ev.on('go:5', function() {
    processRecipes(function(err, message) {
      if (err) log('ProcessRecipes error', err);
      if (message) log('ProcessRecipes message', message);
    });
  });

  ev.trigger('go:0')
})

server.listen(126);
log('Honeycomb', 'server listening on port 126')
