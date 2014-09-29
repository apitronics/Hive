#!/usr/bin/env node

var sys = require('sys'),
    exec = require('child_process').exec,
    cmd = '',
    Settings = require('/root/Hive/Settings.js'),
    sensorDefinitions = require('/root/Hive/util/SensorDefinitions.json'),
    deviceDefinitions = require('/root/Hive/util/DeviceDefinitions.json'),
    server = Settings.CouchDB.URL;

function puts(error, stdout, stderr) { sys.puts(stdout); }

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

// Push the device definitions into the `config` database
deviceDefinitions.forEach(function(deviceDefinition) {
  cmd += 'curl -XPUT ' + server + '/config/' + deviceDefinition._id + ' -d \'' + JSON.stringify(deviceDefinition) + '\'; \n';
});

// Add some default Settings objects in config
cmd += 'curl -XPUT ' + server + '/config/HoneyJarsSettings' + ' -d \'{"lastHarvest": 0, "status": "on"}\'; \n'
cmd += 'curl -XPUT ' + server + '/config/Settings' + ' -d \'{"gmailUserName": "", "gmailPassword":"", "gmailEmailAddress":"", "sendAlertsTo":""}\'; \n'
cmd += 'curl -XPUT ' + server + '/config/drives' + ' -d \'{}\'; \n'

// Run the commands
console.log(cmd)
exec(cmd, puts)
