var log = require('../util/log.js'),
    express = require('express'),
    Backbone = require('backbone'),
    request = require('request-json'),
    HiveBackbone = require('../HiveBackbone/HiveBackbone'),
    Settings = require('../Settings'),
    queenClient = request.newClient(Settings.Queen.URL),
    server = express(),
    bodyParser = require('body-parser'),
    _ = require('underscore');

server.use(bodyParser.json());

server.post('/egg/new', function(req, res){
  var egg = new HiveBackbone.Models.Egg(req.body)
  egg.on('sync', function() {
    queenClient.post(
      'http://127.0.0.1:125/egg/hatch',
      {
        "beeAddress": egg.get('address')
      },
      function(err, response, body) {
        if(!err) {
          res.send('ok')
        }
        else {
          log('Queen', "Error: " + err)
          res.send('fail')
        }
      }
    )
  })
  egg.save()
})


server.post('/egg/hatch', function(req, res){

  var ev = new Backbone.Model(),
      beeAddress = req.body.beeAddress,
      bee = new HiveBackbone.Models.Bee(),
      bees = new HiveBackbone.Collections.BeesByAddress(),
      allBees = new HiveBackbone.Collections.Bees(),
      egg = new HiveBackbone.Models.Egg(),
      sensors = new HiveBackbone.Collections.Sensors(),
      sensorDefinitions = new HiveBackbone.Collections.SensorDefinitions(),
      unhatchedEggsByBeeAddress = new HiveBackbone.Collections.UnhatchedEggsByBeeAddress(),
      beeCount = 1;

  // Find the unhatched Egg by beeAddress
  ev.on('0', function() {
    unhatchedEggsByBeeAddress.params.beeAddress = beeAddress;
    unhatchedEggsByBeeAddress.once('sync', function() {
      egg = unhatchedEggsByBeeAddress.models[0];
      if(!!egg) ev.trigger('1a');
    });
    unhatchedEggsByBeeAddress.fetch();
  });

  // Get total bees
  ev.on('1a', function() {
    allBees.once('sync', function() {
      beeCount = allBees.length + 1;
      ev.trigger('1b');
    });

    allBees.fetch();
  });

  // Create the Bee in the config database
  ev.on('1b', function() {
    bees.params.beeAddress = beeAddress;

    bees.once('sync', function() {
      bee = bees.models[0];
      if(!!bee) {
        ev.trigger('2');
      } else {
        bee = new HiveBackbone.Models.Bee({
          address: beeAddress,
          name: "New Bee #" + beeCount
        });
        bee.on('sync', function() {
          ev.trigger('2');
        });
        bee.save();
      }
    });

    bees.fetch();
  });

  // Get Sensor Definitions
  ev.on('2', function() {
    sensorDefinitions.on('sync', function(){
      sensorDefinitions = _.object(_.map(sensorDefinitions.models, function(sensorDefinition){
          var sensorDefinitionVersion = sensorDefinition.get('firmwareUUID'),
              sensorName = sensorDefinition.get('name');
          sensorDefinitionVersion = parseInt(sensorDefinitionVersion, 16);
          return [sensorDefinitionVersion, sensorName];
        }
      ));
      ev.trigger('2b');
    });

    sensorDefinitions.fetch();
  });

  // Produce Sensor docs from Egg
  ev.on('2b', function() {
    var existingSensors = new HiveBackbone.Collections.SensorsByBeeId(),
      eggSensorUUIDs = egg.get('sensors');

    existingSensors.params.beeId = bee.id;

    existingSensors.on('sync', function(){
      eggSensorUUIDs.forEach(function(sensorUUID, i) {
        var sensorVersion = parseInt(sensorUUID, 16),
            sensor = new HiveBackbone.Models.Sensor({
              "order": i,
              "beeId": bee.id,
              "name": sensorDefinitions[sensorVersion],
              "sensorDefinitionFirmwareUUID": sensorUUID
            }),
            existingSensor = _.filter(existingSensors.models, function(sensor){
                return sensor.get('sensorDefinitionFirmwareUUID') == sensorUUID && sensor.get('order') == i;
              }
            ),
            shouldAddSensor = !existingSensor.length;

        if(shouldAddSensor) sensors.add(sensor);
      });

      ev.trigger('3');
    });

    existingSensors.fetch();
  });

  // Create the Sensors in the config database
  ev.on('3', function() {
    sensors.once('sync', function() {
      ev.trigger('4')
    })
    sensors.save()
  })

  // Update the Egg as hatched
  ev.on('4', function() {
    egg.set('hatched', true)
    egg.once('sync', function() {
      ev.trigger('5')
    })
    egg.save()
  })

  ev.on('5', function() {
    res.send('')
  })

  ev.trigger('0')
})


server.listen(125)
log('Queen', 'server listening on port 125')
