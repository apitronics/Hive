var moment = require('moment'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    HiveBackbone = require('../../HiveBackbone/HiveBackbone');

module.exports = function(dateTime, packet, sensors) {
  // Track the position in the packet we are reading
  var i = 0,
      models = [];

  // Iterate over the sensors, they are ordered by their `order` property
  sensors.models.forEach(function(sensor) {
    var sensorDefinition = sensor.sensorDefinition;

    if(typeof sensorDefinition === 'undefined') return;

    var dataLength = sensorDefinition.get('dataLength') * 2,
        scalar = sensorDefinition.get('scalar'),
        shift = sensorDefinition.get('shift'),
        timestamp = moment(dateTime.concat(' +0000'), "HH:mm:ss, DD/MM/YY ZZ").unix();

    // Data length is in Bytes, convert to the length of characters in a string

    // Parse out our sensor's data string
    var hex = packet.substr(i, dataLength);

    // The sensor data string is in Hex, convert to a Float
    var data = parseInt(hex, 16) / scalar - shift;

    // set the index for the next sensor
    i = i + dataLength;

    var reading = new HiveBackbone.Models.Reading({
      d: data,
      sensorId: sensor.id,
      timestamp: timestamp
    });

    models.push(reading);
  });

  return models;
};
