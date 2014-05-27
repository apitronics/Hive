var moment = require('moment')
var _ = require('underscore')
var Backbone = require('backbone')
var HiveBackbone = require('../../HiveBackbone/HiveBackbone')

module.exports = function(dateTime, packet, sensors, sensorDefinitions) {
  // Track the position in the packet we are reading
  var i = 0
  var models = []
  // Iterate over the sensors, they are ordered by their `order` property
  sensors.models.forEach(function(sensor) {
    // Find the related SensorDefinition for this Sensor
    var sensorDefinition = _.find(sensorDefinitions.models, function(sensorDefinition) {
      var sensorDefinitionsVersion = sensorDefinition.get('firmwareUUID')
      var sensorsVersion = sensor.get('sensorDefinitionFirmwareUUID')
      // Break them down
      sensorDefinitionsVersion = parseInt(sensorDefinitionsVersion.substr(2, sensorDefinitionsVersion.length))
      sensorsVersion = parseInt(sensorsVersion.substr(2, sensorsVersion.length))
      if(sensorDefinitionsVersion == sensorsVersion) {
        return sensorDefinition
      }
    })

    var dataLength = sensorDefinition.get('dataLength') * 2
    var scalar = sensorDefinition.get('scalar')
    var shift = sensorDefinition.get('shift')
    var timestamp = moment(dateTime.concat(' +0000'), "HH:mm:ss, DD/MM/YY ZZ").unix()

    // Data length is in Bytes, convert to the length of characters in a string

    // Parse out our sensor's data string
    var hex = packet.substr(i, dataLength)

    // The sensor data string is in Hex, convert to a Float
    var data = parseInt(hex, 16) / scalar - shift

    // set the index for the next sensor
    i = i + dataLength

    var reading = new HiveBackbone.Models.Reading({
      d: data
    })

    reading.set('timestamp', timestamp)
    reading.set('sensorId', sensor.id)
    models.push(reading)

  })
  return models
}
