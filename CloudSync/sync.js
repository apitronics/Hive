var Backbone = require('backbone'),
    HiveBackbone = require('../HiveBackbone/HiveBackbone'),
    Settings = require('../Settings'),
    nano = require('nano')(Settings.CouchDB.URL),
    request = require('request-json'),
    _ = require('underscore'),
    cloudBees = [],
    cloudSensors = [],
    localBees = [],
    localSensors = [],
    phoneCarriers = [],
    cloudAlerts = [];

var ev = new Backbone.Model(),
    bees = new HiveBackbone.Collections.Bees(),
    sensors = new HiveBackbone.Collections.Sensors(),
    recipes = new HiveBackbone.Collections.Recipes(),
    configDb = nano.use('config'),
    client = request.newClient(Settings.API.URL),
    cloudSettings = {};

ev.on('get_cloud_settings', function(){
  configDb.get('Settings', function(err, body) {
    if (err) {
      console.error(body);
    }
    else {
      cloudSettings = body;

      if(!cloudSettings.saveToCloud){
        log('Turned off');
      } else if(!cloudSettings.cloudUserName || !cloudSettings.cloudPassword) {
        log('Username/password missing');
      } else {
        // Start syncing
        log('****** Syncing ******');
        ev.trigger('login');
      }
    }
  });
});

ev.on('login', function(){
  var data = {
    email: cloudSettings.cloudUserName,
    password: cloudSettings.cloudPassword
  };

  client.post('session', data, function(err, res, body) {
    if(res.statusCode == 200){
      log('Logged in');
      ev.trigger('get_bees');
    } else if(res.statusCode == 401){
      log('Username/password incorrect');
    } else {
      log(err);
    }
  });
});

ev.on('get_bees', function(){
  client.get('bees', function(err, res, bees) {
    if(res.statusCode == 200){
      cloudBees = bees;
      var beeNames = _.map(bees, function(bee){return bee.name;}).join(', ');
      log('Got bees', beeNames);

      ev.trigger('sync_bees_to_cloud');
    } else {
      log('Error getting bees');
    }
  });
});

// Sync bees
ev.on('sync_bees_to_cloud', function() {
  bees.once('sync', function() {
    log('****** Syncing bees ******');

    localBees = bees.models;

    var countBeesToSync = localBees.length;

    _.each(localBees, function(bee){
      var beeName = bee.get('name'),
          beeAddress = bee.get('address'),
          beeUpdatedAt = bee.get('updatedAt'),
          cloudBee = syncBeeTo(bee, cloudBees);

      if(!!cloudBee) {
        log('Syncing cloud bee', beeName);

        var data = {
          address: beeAddress,
          name: beeName,
          updated_at: beeUpdatedAt
        };

        if(cloudBee.syncBeeId === null){
          // create
          client.post('bees', data, function(err, res, body) {
              if(res.statusCode == 200){
                log('Created cloud bee', beeName);
                cloudBees.push(body);
              } else {
                log('Error syncing cloud bee', beeName);
              }

              if(--countBeesToSync === 0){
                ev.trigger('sync_bees_from_cloud');
              }
            }
          );
        } else {
          // update

          client.put('bees/' + cloudBee.syncBeeId, data, function(err, res, body) {
              if(res.statusCode == 200){
                log('Updated cloud bee', beeName);
              } else {
                log('Error syncing cloud bee', beeName);
              }

              if(--countBeesToSync === 0){
                ev.trigger('sync_bees_from_cloud');
              }
            }
          );
        }
      } else {
        log('Skipping cloud bee', beeName);
        if(--countBeesToSync === 0){
          ev.trigger('sync_bees_from_cloud');
        }
      }
    });
  });

  bees.fetch();
});

ev.on('sync_bees_from_cloud', function() {
  _.each(cloudBees, function(bee){
    var beeName = bee.name,
        beeAddress = bee.address,
        beeUpdatedAt = bee.updated_at,
        localBee = syncBeeTo(bee, localBees);

    if(!!localBee) {
      log('Syncing local bee', beeName);

      var data = {
        address: beeAddress,
        name: beeName,
        updatedAt: beeUpdatedAt
      };

      if(localBee.syncBeeId === null){
        // create

        var doc = _.extend(data, {
          kind: "Bee"
        });

        configDb.insert(doc, null, function(err, body) {
          if (!err) {
            log('Created local bee', beeName);
          } else {
            log('Error creating local bee', beeName);
          }
        });
      } else {
        // update
        localBee.set(data);

        localBee.once('sync', function(){
          log('Updated local bee', beeName);
        });

        localBee.save();
      }
    } else {
      log('Skipping local bee', beeName);
    }
  });

  ev.trigger('get_sensors');
});

ev.on('get_sensors', function(){
  client.get('sensors', function(err, res, sensors) {
    if(res.statusCode == 200){
      cloudSensors = sensors;
      var sensorNames = _.map(sensors, function(sensor){return sensor.name;}).join(', ');
      log('Got sensors', sensorNames);

      ev.trigger('sync_sensors_to_cloud');
    } else {
      log('Error getting sensors');
    }
  });
});

// Sync sensors
ev.on('sync_sensors_to_cloud', function() {
  log('****** Syncing sensors ******');

  sensors.once('sync', function() {
    localSensors = sensors.models;

    var countSensorsToSync = localSensors.length;

    _.each(localSensors, function(sensor){
      var sensorName = sensor.get('name'),
          sensorPriority = sensor.get('order'),
          sensorUpdatedAt = sensor.get('updatedAt') || 0,
          sensorBeeId = sensor.get('beeId'),
          sensorDefinitionFirmwareUUID = sensor.get('sensorDefinitionFirmwareUUID'),
          cloudSensor = syncSensorTo(sensor, cloudSensors, false);

      if(!!cloudSensor && !!cloudSensor.syncBeeId) {
        log('Syncing cloud sensor', sensorName);

        var data = {
          name: sensorName,
          priority: sensorPriority,
          updated_at: sensorUpdatedAt,
          sensor_definition_id: getCloudSensorDefinitionId(sensorDefinitionFirmwareUUID)
        };

        if(cloudSensor.syncSensorId === null){
          // create
          client.post('bees/' + cloudSensor.syncBeeId + '/sensors', data, function(err, res, body) {
            if(!err && res.statusCode == 200){
              log('Created cloud sensor', sensorName);
            } else {
              log('Error syncing cloud sensor', sensorName);
            }
            if(--countSensorsToSync === 0){
              ev.trigger('sync_sensors_from_cloud');
            }
          });
        } else {
          // update
          client.put('bees/' + cloudSensor.syncBeeId + '/sensors/' + cloudSensor.syncSensorId, data, function(err, res, body) {
            if(res.statusCode == 200){
              log('Updated cloud sensor', sensorName);
            } else {
              log('Error syncing cloud sensor', sensorName);
            }
            if(--countSensorsToSync === 0){
              ev.trigger('sync_sensors_from_cloud');
            }
          });
        }
      } else {
        log('Skipping cloud sensor', sensorName);
        if(--countSensorsToSync === 0){
          ev.trigger('sync_sensors_from_cloud');
        }
      }
    });
  });

  sensors.fetch();
});

ev.on('sync_sensors_from_cloud', function(){
  _.each(cloudSensors, function(sensor){
    var sensorName = sensor.name,
        sensorBeeId = getLocalBeeId(sensor.bee_id),
        sensorOrder = sensor.priority,
        sensorUpdatedAt = sensor.updated_at,
        sensorSensorDefinitionFirmwareUUID = getLocalSensorDefinitionId(sensor.sensor_definition_id),
        localSensor = syncSensorTo(sensor, localSensors, false);

    if(!!localSensor) {
      log('Syncing local sensor', sensorName);

      var data = {
        beeId: sensorBeeId,
        name: sensorName,
        order: sensorOrder,
        sensorDefinitionFirmwareUUID: sensorSensorDefinitionFirmwareUUID,
        updatedAt: sensorUpdatedAt
      };

      if(localSensor.syncSensorId === null){
        // create
        var doc = _.extend(data, {
          kind: "Sensor"
        });

        configDb.insert(doc, null, function(err, body) {
          if (!err) {
            log('Created local sensor', sensorName);
          } else {
            log('Error creating local sensor', sensorName);
          }
        });
      } else {
        // update
        localSensor.set(data);

        localSensor.once('sync', function(){
          log('Updated local sensor', sensorName);
        });

        localSensor.save();
      }
    } else {
      log('Skipping local sensor', sensorName);
    }
  });

  ev.trigger('sync_sensor_data');
});

// Sync sensor data
ev.on('sync_sensor_data', function() {
  log('****** Syncing sensor data ******');

  _.each(sensors.models, function(sensor, i){
    var sensorName = sensor.get('name'),
        sensorId = sensor.get('_id'),
        sensorBeeId = sensor.get('beeId'),
        sensorDefinitionFirmwareUUID = sensor.get('sensorDefinitionFirmwareUUID'),
        cloudSensor = syncSensorTo(sensor, cloudSensors, true),
        startKey = ((cloudSensor && cloudSensor.last) ? cloudSensor.last.created_at : 0);

    if(!!cloudSensor) {
      log('Syncing sensor data for', sensorName, 'from', startKey);

      var readings = new HiveBackbone.Collections.Readings();

      readings.params = {
        sensor: sensor,
        startkey: (startKey + 1) + "",
        endkey: "99999999999999"
      };

      readings.on('sync', function(){
        var readingsData = _.filter(readings.models, function(reading){ return !!reading.get('d'); });

        sensorData = _.map(readingsData, function(reading){
          var r = {};
          r[reading.get('_id')] = reading.get('d');
          return r;
        });

        var sensorDataLength = sensorData.length;

        if(!!sensorDataLength) {
          var url = 'bees/' + cloudSensor.bee_id + '/sensors/' + cloudSensor.id + '/data';
          var data = {
            data: sensorData
          };

          client.post(url, data, function(err, res, body) {
            if(res.statusCode == 200){
              log('Added', sensorDataLength, 'data points for sensor', sensorName);
            } else {
              log('Error syncing sensor', sensorName);
            }
          });
        }
      });

      readings.fetch();
    } else {
      log('Skipping sensor data for', sensorName);
    }
  });

  ev.trigger('get_phone_carriers');
});

// get phone carriers
ev.on('get_phone_carriers', function(){
  client.get('phone_carriers', function(err, res, phone_carriers) {
    if(res.statusCode == 200){
      phoneCarriers = phone_carriers;
      var carrierNames = _.map(phoneCarriers, function(carrier){return carrier.name;}).join(', ');
      log('Got phone carriers', carrierNames);

      ev.trigger('get_cloud_alerts');
    } else {
      log('Error getting phone carriers');
    }
  });
});

// get alerts
ev.on('get_cloud_alerts', function(){
  client.get('alerts', function(err, res, alerts) {
    if(res.statusCode == 200){
      cloudAlerts = alerts;
      var alertNames = _.map(cloudAlerts, function(alert){return alert.name;}).join(', ');
      log('Got alerts', alertNames);

      ev.trigger('sync_recipes');
    } else {
      log('Error getting alerts');
    }
  });
});

// Sync recipes
ev.on('sync_recipes', function() {
  recipes.once('sync', function() {
    log('****** Syncing recipes ******');

    _.each(recipes.models, function(recipe){

      var action = getAlertTypeSymbol(recipe.get('action')),
          sensorId = recipe.get('sensor'),
          upperLimit = parseFloat(recipe.get('upperLimit')),
          lowerLimit = parseFloat(recipe.get('lowerLimit')),
          phoneNumber = recipe.get('alertPhoneNumber'),
          phoneCarrierId = getPhoneCarrierId(recipe.get('alertPhoneNumberCarrier'), phoneCarriers),
          localSensor = _.find(localSensors, function(sensor){
            return sensor.get('_id') == sensorId;
          }),
          name = (recipe.get('label') || (localSensor.get('name') + ' Alert')),
          cloudSensor = syncSensorTo(localSensor, cloudSensors, true),
          data = {
            lower_limit: lowerLimit,
            name: name,
            phone_carrier_id: phoneCarrierId,
            phone: phoneNumber,
            sensor_id: (cloudSensor ? cloudSensor.id : -1),
            type: action,
            upper_limit: upperLimit
          },
          should_sync = shouldSyncAlert(data, cloudAlerts);

      if(should_sync) {
        client.post('alerts', data, function(err, res, body) {
          if(res.statusCode == 200){
            log('Added cloud alert ', name);
          } else {
            log('Error syncing alert', name);
          }
        });
      } else {
        log('Skipping local alert', name);
      }
    });

    ev.trigger('sync_done');
  });

  recipes.fetch();
});

// Done syncing
ev.on('sync_done', function() {
  log('Syncing finished.');
  return true;
});

ev.trigger('get_cloud_settings');

function log(){
  var args = Array.prototype.slice.call(arguments);
  console.log('Cloud Sync -', args.join(' '));
}

function syncBeeTo(bee, toBees){
  var updatedAt = bee.updated_at || bee.get('updatedAt') || 0,
      beeAddress = bee.address || bee.get('address');

  var toBee = _.find(toBees, function(bee){
      var address = (bee.address || bee.get('address'));
      return address == beeAddress;
    }),
    toBeeUpdatedAt = (!!toBee ? (toBee.updated_at || toBee.get('updatedAt')) : null);

  var returnBee = ((bee instanceof Backbone.Model) ? bee : (!!toBee ? toBee : new HiveBackbone.Models.Bee()));

  returnBee.syncBeeId = !!toBee ? toBee.id : null;

  var shouldSync = ((typeof(toBee) == 'undefined') || (updatedAt > toBeeUpdatedAt));

  if(shouldSync){
    return returnBee;
  } else {
    return false;
  }
}

function syncSensorTo(sensor, toSensors, alwaysSync){
  var updatedAt = sensor.updated_at || sensor.get('updatedAt') || 0,
      cloudBeeId = sensor.bee_id || getCloudBeeId(sensor.get('beeId')),
      sensorAddress = cloudBeeId + '_' + (typeof sensor.priority == 'number' ? sensor.priority : sensor.get('order'));

  var toSensor = _.find(toSensors, function(sensor){
      var address = (sensor.bee_id || getCloudBeeId(sensor.get('beeId'))),
          priority = (typeof sensor.priority == 'number' ? sensor.priority : sensor.get('order'));

      address += '_' + priority;

      return address == sensorAddress;
    }),
    toSensorUpdatedAt = (!!toSensor ? (toSensor.updated_at || toSensor.get('updatedAt')) : null);

  if(alwaysSync) return toSensor;

  var returnSensor = ((sensor instanceof Backbone.Model) ? sensor : (!!toSensor ? toSensor : new HiveBackbone.Models.Sensor()));

  returnSensor.syncSensorId = !!toSensor ? toSensor.id : null;

  returnSensor.syncBeeId = !!toSensor ? toSensor.bee_id : cloudBeeId;

  var shouldSync = ((typeof(toSensor) == 'undefined') || (updatedAt > toSensorUpdatedAt));

  if(shouldSync){
    return returnSensor;
  } else {
    return false;
  }
}

function getCloudBeeId(localBeeId){
  var localBee = _.find(localBees, function(bee){
    return bee.get('_id') == localBeeId;
  });

  if(localBee) {
    var localBeeAddress = localBee.get('address'),
    cloudBee = _.find(cloudBees, function(bee){
      return bee.address == localBeeAddress;
    }),
    cloudBeeId = cloudBee.id;

    return cloudBeeId;
  } else {
    return null;
  }
}

function getLocalBeeId(cloudBeeId){
  var cloudBee = _.find(cloudBees, function(bee){
      return bee.id == cloudBeeId;
    }),
    cloudBeeAddress = cloudBee.address,
    localBee = _.find(localBees, function(bee){
      return bee.get('address') == cloudBeeAddress;
    }),
    localBeeId = !!localBee ? localBee.get('_id') : null;

  return localBeeId;
}

function getAlertTypeSymbol(value){
  switch(value) {
    case 'SendEmail':
      return 'email';
    default:
      return null;
  }
}

function getPhoneCarrierId(domain, phoneCarriers){
  domain = domain.replace('@', '');

  var phone_carrier = _.find(phoneCarriers, function(carrier){
    return carrier.email_domain == domain;
  });

  return phone_carrier.id;
}

function getCloudSensorDefinitionId(localSensorDefinitionUUID){
  return parseInt(localSensorDefinitionUUID, 16);
}

function getLocalSensorDefinitionId(cloudSensorDefinitionId){
  return '0x' + cloudSensorDefinitionId.toString(16);
}

function shouldSyncAlert(localAlert, cloudAlerts){
  var cloudAlert = _.find(cloudAlerts, function(alert){
    var same_id = (alert.sensor_id == localAlert.sensor_id),
        same_lower_limit = (parseFloat(alert.lower_limit) == parseFloat(localAlert.lower_limit)),
        same_upper_limit = (parseFloat(alert.upper_limit) == parseFloat(localAlert.upper_limit));

    return (same_id && same_lower_limit && same_upper_limit);
  });

  if(!!cloudAlert || localAlert.sensor_id == -1) {
    return false;
  } else {
    return true;
  }
}
