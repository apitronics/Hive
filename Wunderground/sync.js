var log = require('../util/log.js'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    HiveBackbone = require('../HiveBackbone/HiveBackbone'),
    moment = require('moment'),
    http = require('http');

var bees = new HiveBackbone.Collections.Bees(),
    existingSync = 0;

bees.once('sync', function(){
  _.each(bees.models, function(bee){
    syncBeeToWunderground(bee);
  });
});

bees.fetch();

log('Wunderground', 'syncing');

function syncBeeToWunderground(bee){
  var beeName = bee.get('name'),
      wundergroundId = bee.get('wundergroundId'),
      wundergroundPassword = bee.get('wundergroundPassword'),
      syncStart = parseInt("0" + bee.get('wundergroundLastSynced'), 10) + 1,
      syncEnd = parseInt(moment().format('X'), 10);

  existingSync = syncStart;

  if(!wundergroundId || !wundergroundPassword || syncStart >= syncEnd){
    // console.log('skipping', beeName);
    return;
  }

  log('Wunderground syncing', beeName);

  var sensors = new HiveBackbone.Collections.SensorsByBeeId();

  sensors.params.beeId = bee.id;

  sensors.on('sync', function(){
    var arrSensors = [],
        arrSensorDefinitions = {},
        sensorDefinitionFirmwareUUIDIntegers = [],
        sensorDefinitions = new HiveBackbone.Collections.SensorDefinitionsByFirmwareUUIDInteger(),
        wundergroundSensors = [],
        wundergroundData = {};

    // get bee sensors
    _.each(sensors.models, function(sensor){
      var sensorDefinitionFirmwareUUID = sensor.get('sensorDefinitionFirmwareUUID'),
          sensorDefinitionFirmwareUUIDInteger = parseInt(sensorDefinitionFirmwareUUID, 16);

      sensor.sensorDefinitionFirmwareUUIDInteger = sensorDefinitionFirmwareUUIDInteger;
      arrSensors.push(sensor);

      // console.log('sensor', sensor.get('name'), sensorDefinitionFirmwareUUIDInteger);

      sensorDefinitionFirmwareUUIDIntegers.push(sensorDefinitionFirmwareUUIDInteger);
    });

    sensorDefinitions.params.sensorDefinitionFirmwareUUIDIntegers = sensorDefinitionFirmwareUUIDIntegers;

    // get sensor definitions
    sensorDefinitions.on('sync', function(){
      _.each(sensorDefinitions.models, function(sensorDefinition){
        var firmwareUUID = sensorDefinition.get('firmwareUUID'),
            firmwareUUIDInteger = parseInt(firmwareUUID, 16),
            wundergroundField = sensorDefinition.get('wundergroundField');

        // can send data to wunderground
        if(!!wundergroundField) {
          arrSensorDefinitions[firmwareUUIDInteger] = sensorDefinition;
        }
      });

      // create list of wunderground sensors
      _.each(arrSensors, function(sensor){
        var wundergroundSensorDefinition = arrSensorDefinitions[sensor.sensorDefinitionFirmwareUUIDInteger];
        if(!!wundergroundSensorDefinition){
          sensor.sensorDefinition = wundergroundSensorDefinition;
          wundergroundSensors.push(sensor);
        }
      });

      // console.log("wundergroundSensors", _.map(wundergroundSensors, function(s){return s.get('name');}));

      var wundergroundSensorsLength = wundergroundSensors.length;
      var currReadings = 0;

      // each wundergroundSensors get readings
      _.each(wundergroundSensors, function(wundergroundSensor){
        var readings = new HiveBackbone.Collections.Readings();

        // console.log('beginning at', syncStart);

        readings.params = {
          sensor: wundergroundSensor,
          startkey: syncStart.toString(),
          endkey: syncEnd.toString()
        };

        readings.on('sync', function(){
          // console.log('got readings', syncStart, 'to', syncEnd, readings.models.length, 'readings');

          _.each(readings.models, function(reading){
            var timestamp = parseInt(reading.get('_id'), 10),
                value = reading.get('d'),
                wundergroundField = wundergroundSensor.sensorDefinition.get('wundergroundField'),
                wundergroundScalar = wundergroundSensor.sensorDefinition.get('wundergroundScalar'),
                wundergroundShift = wundergroundSensor.sensorDefinition.get('wundergroundShift'),
                shiftedValue = value * wundergroundScalar + wundergroundShift;

            if(typeof wundergroundData[timestamp] == 'undefined') wundergroundData[timestamp] = [];

            // console.log(wundergroundField, wundergroundScalar, wundergroundShift, timestamp, shiftedValue);

            wundergroundData[timestamp].push([wundergroundField, shiftedValue]);
          });

          if(++currReadings == wundergroundSensorsLength){
            pushDataToWunderground(wundergroundId, wundergroundPassword, wundergroundData, bee);
          }
        });
        readings.fetch();
      });
    });

    sensorDefinitions.fetch();

  });

  sensors.fetch();
}

function pushDataToWunderground(wundergroundId, wundergroundPassword, data, bee){

  // console.log('wundergroundData', data);

  var index = 0;

  _.each(data, function(values, timestamp){
    var dateutc = moment.unix(timestamp).utc().format("YYYY-MM-DD HH:mm:ss"),
        url = 'http://weatherstation.wunderground.com/weatherstation/updateweatherstation.php?action=updateraw&ID=' + wundergroundId + '&PASSWORD=' + wundergroundPassword + '&dateutc=' + dateutc + '&';

    url += _.map(values, function(value){return value.join('=');}).join('&');
    timestamp = parseInt(timestamp, 10);

    setTimeout(function(){
      // console.log('timestamp', timestamp, 'url', url);

      http.get(url, function(res) {
        res.on('data', function(d) {
          responseText = d.toString().trim();
          // console.log("Got response: " + res.statusCode, responseText);
          if(responseText == 'success'){
            // console.log('success!!', timestamp);
            try {
              if(!!bee && timestamp > existingSync){
                existingSync = timestamp;
                // console.log('updating timestamp', existingSync);
                bee.set({wundergroundLastSynced: timestamp});
                bee.save();
              } else {
                // console.log('skipping timestamp', timestamp);
              }
            }catch(e){}
          } else {
            // console.log('HTTP fail', responseText);
          }
        });
      }).on('error', function(e) {
        log("Wunderground error", e.message);
      });
    }, 1000*index++);
  });
}
