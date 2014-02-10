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


modules.export = function(recipe, info, callback) {

  smtpTransport.sendMail({
      to : recipe.alertEmail,
      from : 'no-reply@apitronics.com',
      subject : 'Hive triggered!',
      text: info.message,
    }, 
    function(err, res) { 
      callback()
    }
  )


})
