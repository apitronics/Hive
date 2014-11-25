var Settings = require('../Settings'),
    log = require('../util/log.js'),
    express = require('express'),
    cors = require('cors'),
    timeout = require('connect-timeout'),
    tellCouchDbAboutDrives = require('./lib/TellCouchDbAboutDrives.js'),
    harvestHoneyJars = require('./lib/HarvestHoneyJars.js');


/*
 * Beekeeper UI on port 8800
 */

var ui = express();

/*
 * Download CSV
 */

ui.get('/download', function(req, res){

  beeId = req.query.beeId;

  if(!!beeId){
    var python = require('child_process').spawn(
    'python',
    [Settings.path + "/Beekeeper/lib/export_csv.py", beeId]
    );

    res.setHeader('Content-disposition', 'attachment; filename=bee_' + beeId + '.csv');

    python.stdout.on('data', function(data){
      res.write(data);
    });

    python.on('close', function(code){
     if (code !== 0) {  return res.send(500, code); }
     return res.end();
    });
  } else { res.send(500, 'No file found'); }
});

ui.get(/^(.+)$/, function(req, res) {
  var filePath = Settings.Beekeeper.path + '/attachments/' + req.params[0];
  res.sendFile(filePath);
});

ui.use(cors());
ui.use(timeout('30m')); // 30 min timeout for downloads
ui.listen(8800);
log('Beekeeper', 'UI listening on port 8800');

/*
 * Set up some processes, staggered
 */

setTimeout(function() {
  log("TellCouchDbAboutDrives", "starting")
  tellCouchDbAboutDrives(function(err, message) {
    if (err) log("TellCouchDbAboutDrives", err)
    if (message) log("TellCouchDbAboutDrives", message)
    setInterval(function() {
      log("TellCouchDbAboutDrives", "starting")
      tellCouchDbAboutDrives(function(err, message) {
        if (err) log("TellCouchDbAboutDrives", err)
        if (message) log("TellCouchDbAboutDrives", message)
      })
    }, Settings.tellCouchDbAboutDrivesFrequencyInMinutes*60*1000)
  })
}, 1000*5*1)

setTimeout(function() {
  log("HarvestHoneyJars", "starting")
  harvestHoneyJars(function(err, message) {
    if (message) log("HarvestHoneyJars", message)
    if (err) log("HarvestHoneyJars", err)
    setInterval(function() {
      log("HarvestHoneyJars", "starting")
      harvestHoneyJars(function(err, message) {
        if (message) log("HarvestHoneyJars", message)
        if (err) log("HarvestHoneyJars", err)
      })
    }, Settings.harvestHoneyJarsFrequencyInMinutes*60*1000)
  })
}, 1000*20*3)

