var express = require('express'),
    log = require('../util/log.js'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    HiveBackbone = require('../HiveBackbone/HiveBackbone'),
    honeyPacketProcessor = require('./lib/HoneyPacketProcessor'),
    processRecipes = require('./lib/ProcessRecipes.js'),
    server = express(),
    spawn = require('child_process').spawn,
    bodyParser = require('body-parser'),
    moment = require('moment');

server.use(bodyParser.json());

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
    var len = _.size(data.data);

    _.each(data.data, function(packet, dateTime, list) {
      var readings = honeyPacketProcessor(dateTime, packet, sensors, sensorDefinitions);

      // Save readings
      _.each(readings, function(reading){
        reading.save();
      });

      if(--len === 0) ev.trigger('go:5');
    });
  });

  ev.once('go:5', function() {
    setTimeout(function(){
      ev.trigger('processRecipes');
      ev.trigger('saveCsq');
      ev.trigger('syncCloud');
    }, 5000);
  });

  ev.on('processRecipes', function() {
    // Process recipes
    processRecipes(function(err, message) {
      if (err) log('ProcessRecipes error', err);
      if (message) log('ProcessRecipes message', message);
    });
  });

  ev.once('saveCsq', function() {
    // Save CSQ
    var csq = data.csq,
        address = data.address.replace(/[^a-z0-9]/gi,'');

    if(typeof csq !== 'undefined' && typeof address !== 'undefined') {
      var modelCsq = new HiveBackbone.Models.Csq({
        _id: address
      });

      modelCsq.once('sync', function(){
        var csqReading = new HiveBackbone.Models.CsqReading({
            beeAddress: address,
            d: csq,
            timestamp: moment().unix()
        });

        csqReading.save();

        bee.set({csq: true});

        if(typeof bee.get('error') == 'undefined') {
          bee.save();
        }
      });

      modelCsq.save();
    }
  });

  ev.on('syncCloud', function() {
    // Sync to cloud
    var sync = spawn('node', ['/root/Hive/CloudSync/sync.js']);

    sync.on('close', function(code) {
      log('Cloud sync complete', 'code ' + code);
    });
  });

  ev.trigger('go:0');
});

server.listen(126);
log('Honeycomb', 'server listening on port 126')
