var nodemailer = require('nodemailer')
var Backbone = require('backbone')
var Settings = require('../../../Settings')
var nano = require('nano')(Settings.CouchDB.URL)
var configDb = nano.use('config')


module.exports = function(recipe, info, callback) {

  configDb.get('Settings', function(err, body) {
    if (err) return callback(err)

    var smtpTransport = nodemailer.createTransport("SMTP",{
      service: "Gmail",
        auth: {
          user: body.gmailUserName,
          pass: body.gmailPassword
        }
      }
    )

    smtpTransport.sendMail({
        to : recipe.alertPhoneNumber + recipe.alertPhoneNumberCarrier,
        from : 'no-reply@apitronics.com',
        subject : 'Hive triggered!',
        text: info.message,
      }, 
      function(err, res) { 
        return callback(err, res)
      }
    )

  })

}