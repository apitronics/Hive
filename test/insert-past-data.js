var http = require('http')
var _ = require('underscore')
var moment = require('moment')
var Settings = require('../Settings')
var Backbone = require('backbone')
var HiveBackbone = require('../HiveBackbone/HiveBackbone')
var nano = require('nano')(Settings.CouchDB.URL)
var configDb = nano.use('config')

request = require('request-json');
var honeyComb = request.newClient(Settings.Honeycomb.URL);


var days = 6
var offset = 6*(24*60*60)
var sampleRateInMinutes = 5
// Should be a total of 2016 honey packets
//var sendRateInSeconds = 5
// Should take 168 minutes

// moment(dateTime, "HH:mm:ss, DD/MM/YY").unix()

var now = moment().unix() - offset
var travelBackTo = now - days*24*60*60
// Start now, move back
var position = now 
var n = 0
var m = 0
function sendPacket() {
  n++
  var dateTime = moment(position, 'X').format("HH:mm:ss, DD/MM/YY")
  var temp = Math.round(((5*Math.cos(((n+m)*Math.PI)/144)) + 30) * 1000)
  console.log(temp)
  console.log(temp.toString(16))
  var data = JSON.parse('{    "address": "60:c5:47:04:f1:94",    "data": {       "' + dateTime + '": "3e0f' + temp.toString(16) + '018c8a32e076c0076c1c1c1c"    }   }')
  honeyComb.post('', data, function(err, res, body) {
    if(position > travelBackTo) {
      position = position - (sampleRateInMinutes*60)
      // recursive
      sendPacket()
    }
    else {
      console.log("Done!")
    }
  })
}
sendPacket()

//setInterval(sendPacket(), sendRateInSeconds*1000)
