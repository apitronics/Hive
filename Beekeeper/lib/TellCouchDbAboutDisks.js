GLOBAL.logContext = 'tell-couchdb-about-disks.js'
var Settings = require('../../Settings')
var l = require('./../../utils/log')
var df = require('node-diskfree');
couchDb = require('nano')(Settings.CouchDB.URL)
var configDb = couchDb.db.use('config')

module.exports = function() {
  var disk;

  function one() {
    configDb.get('disk', function(err, body) {
      if(err) {
        configDb.put('disk', function(err, body) {
          disk = body
          two()
        })
      }
      else {
        disk = body
        two()
      }
    })
  }


  function two() {

    df.drives(function (err, drives) {

      if (err) {
         return  log(err);
      }

      /* retrieve space information for each drives */
      df.drivesDetail(drives,
        function (err, data) {
          if (err) {
              return log(err);
          }

          console.log(data);
        }
      );

    });

  }


  function three() {
    configDb.save(disk, function(err, body) {
      if(err) {   
        log('failed to save disk info')
      }
    }
  }
}
