var log = require('../util/log.js'),
    express = require('express'),
    Backbone = require('backbone'),
    request = require('request-json'),
    HiveBackbone = require('../HiveBackbone/HiveBackbone'),
    Settings = require('../Settings'),
    queenClient = request.newClient(Settings.Queen.URL),
    server = express(),
    _ = require('underscore'),
    convertByFirmwareUUID = require('../HiveBackbone/lib/convertByFirmwareUUID');

server.use(express.bodyParser());


server.post('/egg/new', function(req, res){
  var egg = new HiveBackbone.Models.Egg(req.body);

  egg.on('sync', function() {
    queenClient.post(
      'http://127.0.0.1:125/egg/hatch',
      {
        beeAddress: egg.get('address'),
        devices: egg.get('devices')
      },
      function(err, response, body) {
        if(!err) {
          res.send({ status: 'ok' });
        }
        else {
          log('Queen', "Error: " + err);
          res.send(500, { status: 'fail: ' + err });
        }
      }
    );
  });

  egg.save();
});


server.post('/egg/hatch', function(req, res){

  var ev = new Backbone.Model(),
      allBees = new HiveBackbone.Collections.Bees(),
      bee = new HiveBackbone.Models.Bee(),
      beeAddress = req.body.beeAddress,
      beeCount = 1,
      bees = new HiveBackbone.Collections.BeesByAddress(),
      deviceDefinitions = new HiveBackbone.Collections.DeviceDefinitionsByFirmwareUUIDInteger(),
      devices = new HiveBackbone.Collections.Devices(),
      egg = new HiveBackbone.Models.Egg(),
      existingSensors = new HiveBackbone.Collections.SensorsByBeeId(),
      sensorDefinitions = new HiveBackbone.Collections.SensorDefinitions(),
      unhatchedEggsByBeeAddress = new HiveBackbone.Collections.UnhatchedEggsByBeeAddress();

  // Find the unhatched Egg by beeAddress
  ev.on('start', function() {
    unhatchedEggsByBeeAddress.params.beeAddress = beeAddress;

    unhatchedEggsByBeeAddress.once('sync', function() {
      egg = unhatchedEggsByBeeAddress.models[0];
      if(!!egg) ev.trigger('getBees');
    });

    unhatchedEggsByBeeAddress.fetch();
  });

  // Get total bees
  ev.on('getBees', function() {
    allBees.once('sync', function() {
      beeCount = allBees.length + 1;
      ev.trigger('createBee');
    });

    allBees.fetch();
  });

  // Create the Bee in the config database
  ev.on('createBee', function() {
    bees.params.beeAddress = beeAddress;

    bees.once('sync', function() {
      bee = bees.models[0];

      if(!!bee) {
        ev.trigger('getDeviceDefs');
      } else {
        bee = new HiveBackbone.Models.Bee({
          address: beeAddress,
          name: "New Bee #" + beeCount
        });

        bee.on('sync', function() {
          ev.trigger('getSensorDefs');
        });

        bee.save();
      }
    });

    bees.fetch();
  });

  // Get Sensor Definitions
  ev.on('getSensorDefs', function() {
    sensorDefinitions.on('sync', function() {
      sensorDefinitions = convertByFirmwareUUID(sensorDefinitions);
      // console.log('sensorDefinitions', sensorDefinitions)
      ev.trigger('getDeviceDefs');
    });

    sensorDefinitions.fetch();
  });

  // Get Device Definitions
  ev.on('getDeviceDefs', function() {
    var arrDeviceInts = _.map(egg.get('devices'), function(uuid){
        return parseInt(uuid, 16);
    });

    deviceDefinitions.params.deviceDefinitionFirmwareUUIDIntegers = arrDeviceInts;

    deviceDefinitions.on('sync', function(){
      deviceDefinitions = convertByFirmwareUUID(deviceDefinitions);
      // console.log('deviceDefinitions', deviceDefinitions)
      ev.trigger('getExistingSensors');
    });

    deviceDefinitions.fetch();
  });

  // Get existing sensors
  ev.on('getExistingSensors', function() {
    existingSensors.params.beeId = bee.id;

    existingSensors.on('sync', function() {
      // console.log('existingSensors', existingSensors)
      ev.trigger('createDevices');
    });

    existingSensors.fetch();
  });

  // Produce Device docs
  ev.on('createDevices', function() {
    var sensorIndex = 0, deviceIndex = 0;

    // console.log('devices', egg.get('devices'))

    _.each(egg.get('devices'), function(deviceUUID){
      var deviceVersion = parseInt(deviceUUID, 16),
          deviceDefinition = deviceDefinitions[deviceVersion];

      if(typeof deviceDefinition !== 'undefined'){
        var device = new HiveBackbone.Models.Device({
          beeId: bee.id,
          deviceDefinitionFirmwareUUID: deviceDefinition.get('firmwareUUID'),
          name: deviceDefinition.get('name'),
          order: deviceIndex
        });

        device.on('sync', function() {
          // console.log('sensors', device.get('name'), deviceDefinition.get('sensors'))

          // Produce Sensor docs
          _.each(deviceDefinition.get('sensors'), function(sensorUUID) {
            var sensorVersion = parseInt(sensorUUID, 16),
                sensorDefinition = sensorDefinitions[sensorVersion],
                sensor = new HiveBackbone.Models.Sensor({
                  order: sensorIndex,
                  beeId: bee.id,
                  deviceId: device.id,
                  name: sensorDefinition.get('name'),
                  sensorDefinitionFirmwareUUID: sensorDefinition.get('firmwareUUID')
                }),
                existingSensor = _.filter(existingSensors.models, function(sensor){
                return sensor.get('sensorDefinitionFirmwareUUID') == sensorUUID && sensor.get('order') == sensorIndex;
              }),
              shouldAddSensor = !existingSensor.length;

            // console.log('sensor', sensor, shouldAddSensor)
            if(shouldAddSensor) sensor.save();
            sensorIndex++;
          });
        });

        device.save();
      }

      deviceIndex++;
    });

    ev.trigger('hatchEgg');
  });

  // Update the Egg as hatched
  ev.on('hatchEgg', function() {
    egg.set('hatched', true);

    egg.once('sync', function() {
      ev.trigger('end');
    });

    egg.save();
  });

  ev.on('end', function() {
    res.send({ status: 'ok' });
  });

  ev.trigger('start');
});


server.listen(125);
log('Queen', 'server listening on port 125');
