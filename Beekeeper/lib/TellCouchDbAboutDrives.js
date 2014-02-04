var Settings = require('./../../Settings')
couchDb = require('nano')(Settings.CouchDB.URL)
var configDb = couchDb.db.use('config')
var df = require('node-diskfree')
var _ = require('underscore')

module.exports = function(callback) {


  var drivesDoc
  var drivesInfo
  var drives


  function getDrivesDoc(done) {

    configDb.get('drives', function(err, body) {
      if(!err) {
        drivesDoc = body
        done()
      }
      else { callback('fail: getDrivesDoc') }
    })

  }


  function getDrives(done) {

    df.drives(function (err, data) {
      drives = data
      done()
    })

  }


  function getDrivesInfo(done) {
    df.drivesDetail(drives, function (err, data) {
      if(!err) { 
        drivesInfo = data
        done()
      }
      else { callback('fail: getDrivesInfo') } 
    })

  }


  function saveNewDrivesDoc(done) {

    _.each(drivesInfo, function (value, key, list) {
      drivesDoc[drives[key]] = value
    })

    configDb.insert(drivesDoc, function(err, body) {
      if(!err) {
        drivesDoc = body
        done()
      }
      else { callback('fail: saveNewDrivesDoc') }
    })

  }


  getDrivesDoc(function() {
    getDrives(function() {
      getDrivesInfo(function() {
        saveNewDrivesDoc(function () {
          callback(null, drivesDoc)
  })})})})

 
}
