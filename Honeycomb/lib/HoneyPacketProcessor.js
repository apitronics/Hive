var moment = require('moment')
var _ = require('underscore')
var Backbone = require('backbone')
var HiveBackbone = require('../../HiveBackbone/HiveBackbone')

module.exports = function(dateTime, packet, sensors, sensorDefinitions) {
  console.log("::HONEY PACKET PARSING::")
  console.log('packet:')
  console.log(packet)
  // Track the position in the packet we are reading
  var i = 0
  var models = []
  // Iterate over the sensors, they are ordered by their `order` property
  sensors.models.forEach(function(sensor) { 
    // Find the related SensorDefinition for this Sensor
    //console.log('sensorDefinitions.models.length')
    //console.log(sensorDefinitions.models.length)
    var sensorDefinition = _.find(sensorDefinitions.models, function(sensorDefinition) {
      var sensorDefinitionsVersion = sensorDefinition.get('firmwareUUID')
      var sensorsVersion = sensor.get('sensorDefinitionFirmwareUUID')
      //console.log('before:')
      //console.log(sensorDefinitionsVersion)
      //console.log(sensorsVersion)
      // Break them down
      sensorDefinitionsVersion = parseInt(sensorDefinitionsVersion.substr(2, sensorDefinitionsVersion.length))
      sensorsVersion = parseInt(sensorsVersion.substr(2, sensorsVersion.length))
      //console.log('after:')
      //console.log(sensorDefinitionsVersion)
      //console.log(sensorsVersion)
      if(sensorDefinitionsVersion == sensorsVersion) {
        return sensorDefinition
      }
    })

    console.log('sensorDefinition being used:')
    console.log(sensorDefinition.toJSON())

    var dataLength = sensorDefinition.get('dataLength')
    var scalar = sensorDefinition.get('scalar')
    var shift = sensorDefinition.get('shift')
    var timestamp = moment(dateTime, "HH:mm:ss, DD/MM/YY").unix()
    //console.log('timestamp:')
    //console.log(timestamp)

    // Data length is in Bytes, convert to the length of characters in a string
    //var stringLength = sensorDefinition.get('dataLength') * 2
    //console.log('stringLength:')
    //console.log(stringLength)

    // Parse out our sensor's data string
    var hex = packet.substr(i, dataLength)
    console.log('hex:')
    console.log(hex)

    // The sensor data string is in Hex, convert to a Float
    var data = (parseInt(hex, 16) * scalar) + shift
    // set the index for the next sensor
    i = i + dataLength

    //console.log('i now at ' + i)

    var reading = new HiveBackbone.Models.Reading({
      d: data
    })
    reading.set('timestamp', timestamp)
    reading.set('sensorId', sensor.id)
    console.log('reading:')
    console.log(reading.toJSON())
    models.push(reading)
  })
console.log(models)
  return models
}
