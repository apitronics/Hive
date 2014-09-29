var HiveBackbone = require('../../HiveBackbone/HiveBackbone.js'),
    Settings = require('../../Settings'),
    _ = require('underscore'),
    log = require('../../util/log.js');

_.string = require('underscore.string');
_.mixin(_.string.exports());

module.exports = function(devices, response, callback) {
  var written = false,
      queue = 0,
      commands = [];

  devices.models.forEach(function(device) {
    var deviceVersion = device.get('deviceDefinitionFirmwareUUID'),
        automatedAt = device.get('automatedAt') || 0,
        updatedAt = device.get('updatedAt') || 0,
        order = device.get('order'),
        deviceDefinition = device.deviceDefinition,
        spawn = require('child_process').spawn,
        parameters = !!deviceDefinition ? deviceDefinition.get('parameters') : [],
        schema = {},
        keys = _.map(parameters, function(input){
          return _(_(input.name).slugify()).camelize();
        }),
        data = _.each(keys, function(key){
          schema[key] = device.get(key);
        }),
        json = JSON.stringify(schema);

    if(!!deviceVersion) {
      // console.log('Last updated at', updatedAt)
      // console.log('Last automated at', automatedAt)

      if(updatedAt > automatedAt) {
        // console.log('Getting packet for device', deviceVersion, 'with JSON', json)

        written = true;
        queue++;

        var res = spawn('python', [Settings.path + '/Honeycomb/lib/writes/' + deviceVersion + '.py', json]);

        res.stdout.on('data', function(data){
          var hexData = _(data.toString()).trim(),
              hexOrder = String('0' + (order).toString(16)).slice(-2),
              command = {
                order: hexOrder,
                data: hexData
              };

          if(!!hexData){
            // console.log(command)
            commands.push(command);
          }
        });

        res.on('close', function(code) {
          // console.log('Parse device packet', 'code ' + code)
          if(code !== 0) {
            log('Python write script failed', deviceVersion);
          }

          if(--queue === 0) {
            var size = _.size(commands),
                hexSize = String('0' + (size).toString(16)).slice(-2),
                hexOrder = _.pluck(commands, 'order').join(''),
                hexData = _.pluck(commands, 'data').join(''),
                hexCommand = hexSize + hexOrder + hexData;

            // console.log(commands, size, hexSize, hexOrder, hexData, hexCommand)

            if(size > 0) {
              response.send({command: hexCommand});
            } else {
              response.send(500, {status: 'write command fail'});
            }
          }
        });

        var timestamp = Math.round(new Date().getTime() / 1000);

        device.set({automatedAt: timestamp});
        device.save();
      } else {
        // Haven't updated since last automation
        // console.log("Haven't updated since last automated", deviceVersion);
      }
    } else {
      // No device definition
    }
  });

  if(!written && queue === 0){
    response.send({status: 'ok'});
  }
};
