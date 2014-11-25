#!/usr/bin/env node

var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { sys.puts(stdout) }
var cmd = ''
var Settings = require('/root/Hive/Settings.js')
var sensorDefinitions = require('/root/Hive/util/SensorDefinitions.json')

var server = Settings.CouchDB.URL

// Create databases
cmd += 'curl -XPUT ' + server + '/config; \n'
cmd += 'curl -XPUT ' + server + '/incubator; \n'
cmd += 'curl -XPUT ' + server + '/apps; \n'

// Push views and the couchapp for devices not compatible with mDNS
cmd += 'couchapp push ./CouchViews/config.js ' + server + '/config; \n'
cmd += 'couchapp push ./CouchViews/incubator.js ' + server + '/incubator; \n'
cmd += 'couchapp push ./Beekeeper/couchapp.js ' + server + '/apps; \n'

// Push the sensor definitions into the `config` database
sensorDefinitions.rows.forEach(function(sensorDefinition) {
  var sensorDef = sensorDefinition.doc
  cmd += 'curl -XPUT ' + server + '/config/' + sensorDef._id + ' -d \'' + JSON.stringify(sensorDef) + '\'; \n'
})

// Add some default Settings objects in config
cmd += 'curl -XPUT ' + server + '/config/HoneyJarsSettings' + ' -d \'{"lastHarvest": 0, "status": "on"}\'; \n'
cmd += 'curl -XPUT ' + server + '/config/Settings' + ' -d \'{"gmailUserName": "", "gmailPassword":"", "gmailEmailAddress":"", "sendAlertsTo":"", "autoUpdateHive":true, "saveToCloud":true}\'; \n'
cmd += 'curl -XPUT ' + server + '/config/drives' + ' -d \'{}\'; \n'

// Run the commands
console.log(cmd)
exec(cmd, puts)
