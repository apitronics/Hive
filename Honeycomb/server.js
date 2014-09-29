var express = require('express'),
    log = require('../util/log.js'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    HiveBackbone = require('../HiveBackbone/HiveBackbone'),
    honeyPacketProcessor = require('./lib/HoneyPacketProcessor'),
    moment = require('moment'),
    processRecipes = require('./lib/ProcessRecipes.js'),
    server = express(),
    spawn = require('child_process').spawn,
    deviceDataProcessor = require('./lib/ProcessDeviceData'),
    convertByFirmwareUUID = require('../HiveBackbone/lib/convertByFirmwareUUID');

server.use(express.bodyParser());

server.post('/*', function(req, res){
  var data = req.body;
  // Event dispatcher for this process
  var ev = new Backbone.Model(),

  // Set up our Collections
  bee = new HiveBackbone.Models.Bee(),
	bees = new HiveBackbone.Collections.BeesByAddress(),
  sensorDefinitions = new HiveBackbone.Collections.SensorDefinitionsByFirmwareUUIDInteger(),
  sensors = new HiveBackbone.Collections.SensorsByBeeId(),
  deviceDefinitions = new HiveBackbone.Collections.DeviceDefinitionsByFirmwareUUIDInteger(),
  devices = new HiveBackbone.Collections.DevicesByBeeId();

  // Look up the Bee that has this address
  ev.on('start', function() {
    bees.params.beeAddress = data.address;
    bees.on('sync', function() {
      bee = bees.models[0];
      if(!!bee) {
        ev.trigger('getSensors');
        ev.trigger('getDevices');
      } else {
        log('Bee not found for address', data.address);
      }
    });
    bees.fetch();
  });

  // Look up the Sensor Docs whose bee property is bee.id
  ev.on('getSensors', function() {
    sensors.params.beeId = bee.id;

    sensors.on('sync', function() {
      ev.trigger('loadSensorDefs');
    });

    sensors.fetch();
  });

  ev.on('getDevices', function() {
    devices.params.beeId = bee.id;

    devices.on('sync', function() {
      ev.trigger('loadDeviceDefs');
    });

    devices.fetch();
  });

  ev.on('loadSensorDefs', function() {
    var arrSensorDefinitionFirmwareUUIDInts = _.map(sensors.models, function(sensor){ return parseInt(sensor.get('sensorDefinitionFirmwareUUID'), 16); });

    // console.log('sensorDefinitions', sensorDefinitions.params)
    sensorDefinitions.params.sensorDefinitionFirmwareUUIDIntegers = arrSensorDefinitionFirmwareUUIDInts;

    sensorDefinitions.on('sync', function() {
      sensorDefinitions = convertByFirmwareUUID(sensorDefinitions);

      _.each(sensors.models, function(sensor){
        var sensorDefinition = sensorDefinitions[parseInt(sensor.get('sensorDefinitionFirmwareUUID'), 16)];

        sensor.sensorDefinition = sensorDefinition;
      });

      ev.trigger('processSensors');
    });

    sensorDefinitions.fetch();
  });

  ev.once('loadDeviceDefs', function() {
    var arrDeviceDefinitionFirmwareUUIDInts = _.map(devices.models, function(device){ return parseInt(device.get('deviceDefinitionFirmwareUUID'), 16); });

    // console.log('deviceDefinitions', deviceDefinitions.params)
    deviceDefinitions.params.deviceDefinitionFirmwareUUIDIntegers = arrDeviceDefinitionFirmwareUUIDInts;

    deviceDefinitions.once('sync', function() {
      deviceDefinitions = convertByFirmwareUUID(deviceDefinitions);

      _.each(devices.models, function(device){
        var deviceDefinition = deviceDefinitions[parseInt(device.get('deviceDefinitionFirmwareUUID'), 16)];

        device.deviceDefinition = deviceDefinition;
      });

      ev.trigger('processDevices');
    });

    deviceDefinitions.fetch();
  });

  ev.once('processDevices', function(){
    deviceDataProcessor(devices, res);
  });

  // Run each Honey Packet in data through the honeyPacketProcessor
  ev.on('processSensors', function() {
    var len = _.size(data.data);

    _.each(data.data, function(packet, dateTime, list) {
      var readings = honeyPacketProcessor(dateTime, packet, sensors);

      // Save readings
      _.each(readings, function(reading){
        reading.save();
      });

      if(--len === 0) ev.trigger('postProcess');
    });
  });

  ev.on('postProcess', function() {
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

  ev.trigger('start');
});

server.listen(126);
log('Honeycomb', 'server listening on port 126');
