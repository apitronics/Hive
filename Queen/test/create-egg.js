
var sys = require('sys')
var exec = require('child_process').exec;
var Settings = require('../Settings')
function puts(error, stdout, stderr) { sys.puts(stdout) }
var cmd = ''

var egg =   {
    "sensors": ["0x01", "0x02", "0x10", "0x11", "0x12", "0x15", "0x13", "0x14", "0x16", "0x17", "0x17", "0x17"],
    "address": "60:c5:47:04:f1:94"
  }
cmd += 'curl -XPOST ' + Settings.Queen.URL + '/egg/new -H "Content-Type: Application/json" -d \'' + JSON.stringify(egg) + '\'; \n'

console.log(cmd)
exec(cmd, puts)
