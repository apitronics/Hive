var express = require('express');
var Backbone = require('backbone')
var request = require('request-json')
var HiveBackbone = require('../HiveBackbone/HiveBackbone')
var Settings = require('../Settings')
var queenClient = request.newClient(Settings.Queen.URL)
var server = express();

server.use(express.bodyParser())
 

server.post('/egg/new', function(req, res){
  var egg = new HiveBackbone.Models.Egg(req.body)
  egg.on('sync', function() {
    queenClient.post(
      'http://127.0.0.1:125/egg/hatch', 
      {
        "beeAddress": egg.get('address'), 
        "name": "New Bee #" + (new Date()).getTime()
      },
      function(err, response, body) {
        if(!err) {
          res.send('ok')
        }
        else {
          console.log(err)
          res.send('fail')
        }
      }
    )
  })
  egg.save()
})


server.post('/egg/hatch', function(req, res){

  var ev = new Backbone.Model()
  var beeAddress = req.body.beeAddress
  console.log(beeAddress)
  var egg = new HiveBackbone.Models.Egg()
  var bee = new HiveBackbone.Models.Bee({address: beeAddress, name: req.body.name})
  var sensors = new HiveBackbone.Collections.Sensors() 

  // Find the unhatched Egg by beeAddress
  ev.on('0', function() {
    console.log('EV:0')
    var unhatchedEggsByBeeAddress = new HiveBackbone.Collections.UnhatchedEggsByBeeAddress()
    unhatchedEggsByBeeAddress.params.beeAddress = beeAddress
    unhatchedEggsByBeeAddress.once('sync', function() {
      egg = unhatchedEggsByBeeAddress.models[0]
      ev.trigger('1')
    })
    unhatchedEggsByBeeAddress.fetch()
  })

  // Create the Bee in the config database
  ev.on('1', function() {
    console.log('EV:1')
    bee.once('sync', function() {
      ev.trigger('2')
    })
    bee.save()
  })

  // Produce Sensor docs from Egg
  ev.on('2', function() {
    console.log('EV:2')
    var i = 0
    egg.attributes.sensors.forEach(function(sensor) {
      var sensor = new HiveBackbone.Models.Sensor({
        "order": i,
        "beeId": bee.id,
        "sensorDefinitionFirmwareUUID": sensor 
      })
      sensors.add(sensor)
      i++
    })
    ev.trigger('3') 
  })

  // Create the Sensors in the config database
  ev.on('3', function() {
    console.log('EV:3')
    console.log(sensors.models.length)
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
    console.log('EV:5')
    res.send('')
  })

  ev.trigger('0')
})


server.listen(125);
console.log('Queen server listening on port 125');
