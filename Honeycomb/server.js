var express = require('express');
var _ = require('underscore')
var Backbone = require('backbone')
var HiveBackbone = require('../HiveBackbone/HiveBackbone')
var honeyPacketProcessor = require('./HoneyPacketProcessor')
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
    console.log('go:0')
    bees.params.beeAddress = data.address 
    bees.on('sync', function() {
      console.log('bees.models.length:')
      console.log(bees.models.length)
      bee = bees.models[0]
      console.log('bee')
      console.log(bee.toJSON())
      ev.trigger('go:1')
    })
    bees.fetch()
  })

  // Look up the Sensor Docs whose bee property is bee.id
  ev.on('go:1', function() {
    console.log('go:1')
    sensors.params.beeId = bee.id 
    sensors.on('sync', function() {
      console.log("sensors.models.length")
      console.log(sensors.models.length)
      ev.trigger('go:2')
    })
    sensors.fetch()
  })

  // Get all SensorDefinitions
  ev.on('go:2', function() {
    console.log('go:2')
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
    console.log(sensorDefinitions.params)
    sensorDefinitions.on('sync', function() {
      ev.trigger('go:3')
    })
    sensorDefinitions.fetch()
  })


  // Run each Honey Packet in data through the honeyPacketProcessor 
  ev.on('go:3', function() {
    console.log('go:3')
    _.each(data.data, function(packet, dateTime, list) {
      readings.add(honeyPacketProcessor(dateTime, packet, sensors, sensorDefinitions))
    })
    ev.trigger('go:4')
  })

  // Save readings
  ev.on('go:4', function() {
    readings.once('sync', function() {
      console.log('readings saved')
    })
    readings.save()
  })

  ev.trigger('go:0')
})

server.listen(126);
console.log('Honeycomb server listening on port 126');
