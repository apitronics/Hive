var nodemailer = require('nodemailer')
var Backbone = require('backbone')
var Settings = require('../../Settings')
var nano = require('nano')(Settings.CouchDB.URL)
var configDb = nano.db('config')
var evaluateTrigger = require('./evaluateTrigger.js')

var smtpTransport = nodemailer.createTransport("SMTP",{
service: "Gmail",
  auth: {
    user: "rj@rjsteinert.com",
    pass: "JollyHiveMan"
  }
});


modules.export = function() {

  var ev = new Backbone.Model()
  var triggers

  // Get Trigger docs
  ev.on('0', function() {


  configDb.allDocs({include_docs:true}, function(err, res) {

    var triggers = []
    _.each(res.rows, function(row) {
      if(row.doc.kind == "trigger") {
        triggers.push(row.doc)
      }
    })

  })

  ev.on('1', function() {
    var i = 0
    var callback = function() {
      i++
      if(i == triggers.length) {
        // All triggers have been evaluated
        ev.trigger('2')
      }
    }
    _.each(triggers, function(trigger) {
      evaluateTrigger(callback)
    })
  })
    // For each Trigger doc, see if assigned Sensor has Readings outside of Trigger's define range



      var anHourAgo = ((new Date().getTime())/1000) - (60*60)

      rq('http://127.0.0.1:5984/sensor_' + trigger.sensor + '/_all_docs?include_docs=true&start_key=' + anHourAgo, function(err, res, body) {
        var reading = (JSON.parse(body)).rows[0].doc
        if(reading.value >= trigger.upperLimit || reading.value <= trigger.lowerLimit) {
          smtpTransport.sendMail(
            {
              to : trigger.alertEmail,
              from : 'no-reply@apitronics.com',
              subject : 'Hive trigger!',
              text: 'Hive has been triggered.',
            }, 
            function(err, res) { }
          )
        }
      })

    })

  })

})

HiveServices.listen(1145);
