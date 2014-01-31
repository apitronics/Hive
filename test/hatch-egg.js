// NO NEED TO RUN THIS! Eggs hatch upon creation for now.
var sys = require('sys')
var exec = require('child_process').exec;
var Settings = require('../Settings')
function puts(error, stdout, stderr) { sys.puts(stdout) }
var cmd = ''

cmd += 'curl -XPOST ' + Settings.Queen.URL + '/egg/hatch -H "Content-Type: Application/json" -d \'
  {
    "beeAddress": "60:c5:47:04:f1:94",
    "name": "BravoBee"
  }
\'; \n'

console.log(cmd)
exec(cmd, puts)
