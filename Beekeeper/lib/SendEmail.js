
modules.export = function() {
  // Get Trigger docs
  var configDb = Pouch(Settings.CouchDB.URL + '/swarm_074af5bcb3299b9256f204587500037c_config')
  configDb.allDocs({include_docs:true}, function(err, res) {
    var triggers = []
    _.each(res.rows, function(row) {
      if(row.doc.kind == "trigger") {
        triggers.push(row.doc)
      }
    })
    console.log(triggers)
    // For each Trigger doc, see if assigned Sensor has Readings outside of Trigger's define range
    _.each(triggers, function(trigger) {
      rq('http://127.0.0.1:5984/readings/_all_docs?include_docs=true&limit=1&startkey="' + trigger.sensor + '"', function(err, res, body) {
        console.log(body)
        var reading = (JSON.parse(body)).rows[0].doc
        console.log(reading)
        // If Reading.value outside Trigger's range, send an email given provided phone, carrier, and email values.
        if(reading.value >= trigger.upperLimit || reading.value <= trigger.lowerLimit) {
          console.log('yup')
          if(trigger.alertPhoneNumber) {
            console.log('v')
            /*
            var options = {
              url: 'http://127.0.0.1:9845/email',
              to: "+1" + trigger.alertPhoneNumber + trigger.alertPhoneNumberCarrier,
              from: "hive-alert@apitronics.com",
              subject: 'Your trigger "' + trigger.label + '" has been triggered',
              body: 'Your trigger "' + trigger.label + '" has been triggered',
            }
            rq.put(options)
            */
          }
          if(trigger.alertEmail) {
            /*
            var options = {
              url: 'http://127.0.0.1:9845/email',
              to: "+1" + trigger.alertPhoneNumber + trigger.alertPhoneNumberCarrier,
              from: "hive-alert@apitronics.com",
              subject: 'Your trigger "' + trigger.label + '" has been triggered',
              body: 'Your trigger "' + trigger.label + '" has been triggered',
            }
            */

            var smtpTransport = nodemailer.createTransport("SMTP",{
                 service: "Gmail",
                    auth: {
                         user: "rj@rjsteinert.com",
                        pass: "JollyHiveMan"
                                       }
            });

            smtpTransport.sendMail({
              //path: '/usr/bin/mailx',
              to : trigger.alertEmail,
              from : 'rj@rjsteinert.com',
              subject : 'Hive trigger!',
              text: 'Hive has been triggered.',
            }, function(err, res) {
            console.log(err)
            console.log(res)
              
            }
            )




          }
        }
      })
    })
  })
})

HiveServices.listen(1145);
