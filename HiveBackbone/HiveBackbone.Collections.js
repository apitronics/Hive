var _ = require('underscore'),
    Backbone = require('backbone'),
    HiveBackbone = {Models: require('./HiveBackbone.Models')},
    Settings = require('../Settings'),
    nano = require('nano')(Settings.CouchDB.URL);

module.exports = {

  Bees: Backbone.Collection.extend({
    model: HiveBackbone.Models.Bee,
    params: {},
    sync: function (method, collection, options) {
      var db = nano.use('config');
      switch (method) {
        case 'read':
          db.view('api', 'Bees',{"include_docs": true}, function(err, body) {
            collection.models = [];
            _.each(body.rows, function(row) {
              collection.add(row.doc);
            });
            collection.trigger('sync');
          });
          break;
      }
    }
  }),

  BeesByAddress: Backbone.Collection.extend({
    model: HiveBackbone.Models.Bee,
    params: {
      beeAddress: null
    },
    sync: function (method, collection, options) {
      var db = nano.use('config');
      switch (method) {
        case 'read':
          db.view('api', 'BeesByAddress',{"keys":[this.params.beeAddress], "include_docs": true}, function(err, body) {
            body.rows.forEach(function(row) {
              collection.add(row.doc);
            });

            collection.trigger('sync');
          });
          break;
      }
    }
  }),

  DeviceDefinitions: Backbone.Collection.extend({
    model: HiveBackbone.Models.DeviceDefinition,
    params: {
    },
    sync: function (method, collection, options) {
      var db = nano.use('config');
      switch (method) {
        case 'read':
          db.view('api', 'DeviceDefinitions',{"include_docs": true}, function(err, body) {
            collection.models = [];
            _.each(body.rows, function(row) {
              collection.add(row.doc);
            });
            collection.trigger('sync');
          });
          break;
      }
    }
  }),

  DeviceDefinitionsByFirmwareUUIDInteger: Backbone.Collection.extend({
    model: HiveBackbone.Models.DeviceDefinition,
    params: {
      deviceDefinitionFirmwareUUIDIntegers: []
    },
    sync: function (method, collection, options) {
      var db = nano.use('config');
      switch (method) {
        case 'read':
          db.view('api', 'DeviceDefinitionsByFirmwareUUIDInteger',{"include_docs": true, "keys": this.params.deviceDefinitionFirmwareUUIDIntegers}, function(err, body) {
            collection.models = [];
            _.each(body.rows, function(row) {
              collection.add(row.doc);
            });
            collection.trigger('sync');
          });
          break;
      }
    }
  }),

  Devices: Backbone.Collection.extend({
    model: HiveBackbone.Models.Device,
    comparator: 'order',
    params: {},
    save: function() {
      // Setup
      var collection = this;
      if(!collection.hasOwnProperty('savePosition')) {
        collection.savePosition = 0;
      }
      // Run
      if (collection.savePosition > collection.models.length-1) {
        collection.savePosition = 0;
        collection.trigger('sync');
      }
      else {
        var model = collection.models[collection.savePosition];
        model.on('sync', function() {
          collection.savePosition++;
          collection.save();
        });
        model.save();
      }
    },
    sync: function (method, collection, options) {
      var db = nano.use('config');
      switch (method) {
        case 'read':
          db.view('api', 'Devices',{"include_docs": true}, function(err, body) {
            collection.models = [];
            _.each(body.rows, function(row) {
              collection.add(row.doc);
            });
            collection.trigger('sync');
          });
          break;
      }
    }
  }),

  DevicesByBeeId: Backbone.Collection.extend({
    model: HiveBackbone.Models.Device,
    comparator: 'order',
    params: {
      beeId: null
    },
    sync: function (method, collection, options) {
      var db = nano.use('config');
      switch (method) {
        case 'read':
          db.view('api', 'DevicesByBeeId',{"include_docs": true, "keys":[this.params.beeId]}, function(err, body) {
            collection.models = [];
            _.each(body.rows, function(row) {
              collection.add(row.doc);
            });
            collection.trigger('sync');
          });
          break;
      }
    }
  }),

  Readings: Backbone.Collection.extend({
    params: {
      sensor: null,
      startkey: null,
      endkey: null
    },
    model: HiveBackbone.Models.Reading,
    sync: function (method, collection, options) {
      var db = nano.use(this.params.sensor.dbName());
      switch (method) {
        case 'read':
          db.list({"startkey": collection.params.startkey, "endkey": collection.params.endkey, include_docs:true}, function(err, body) {
            if(body && body.hasOwnProperty('rows') && body.rows.length > 0) {
              body.rows.forEach(function(row) {
                collection.add(row.doc);
              });
            }
            collection.trigger('sync');
          });
          break;
      }
    },
    // A save function for Collections! RJ wrote this himself after looking at other attempts that didn't quite do it.
    save: function() {
      // Setup
      var collection = this;
      if(!collection.hasOwnProperty('savePosition')) {
        collection.savePosition = 0;
      }
      // Run
      if (collection.savePosition > collection.models.length-1) {
        collection.savePosition = 0;
        collection.trigger('sync');
      }
      else {
        var model = collection.models[collection.savePosition];

        model.on('sync', function() {
          collection.savePosition++;
          collection.save();
        });

        model.save();
      }
    }
  }),

  Recipes: Backbone.Collection.extend({
    model: HiveBackbone.Models.Recipe,
    params: {},
    sync: function (method, collection, options) {
      var db = nano.use('config');
      switch (method) {
        case 'read':
          db.view('api', 'Recipes', {"include_docs": true}, function(err, body) {
            collection.models = [];
            _.each(body.rows, function(row) {
              collection.add(row.doc);
            });
            collection.trigger('sync');
          });
          break;
      }
    }
  }),

  SensorDefinitions: Backbone.Collection.extend({
    model: HiveBackbone.Models.SensorDefinition,
    params: {},
    sync: function (method, collection, options) {
      var db = nano.use('config');
      switch (method) {
        case 'read':
          db.view('api', 'SensorDefinitions',{"include_docs": true}, function(err, body) {
            collection.models = [];

            _.each(body.rows, function(row) {
              collection.add(row.doc);
            });

            collection.trigger('sync');
          });
          break;
      }
    }
  }),

  SensorDefinitionsByFirmwareUUIDInteger: Backbone.Collection.extend({
    model: HiveBackbone.Models.SensorDefinition,
    params: {
      sensorDefinitionFirmwareUUIDIntegers: []
    },
    sync: function (method, collection, options) {
      var db = nano.use('config');
      switch (method) {
        case 'read':
          db.view('api', 'SensorDefinitionsByFirmwareUUIDInteger',{"include_docs": true, "keys":this.params.sensorDefinitionFirmwareUUIDIntegers}, function(err, body) {
            collection.models = [];

            _.each(body.rows, function(row) {
              collection.add(row.doc);
            });

            collection.trigger('sync');
          });
          break;
      }
    }
  }),

  Sensors: Backbone.Collection.extend({
    model: HiveBackbone.Models.Sensor,
    comparator: 'order',
    params: {},
    save: function() {
      // Setup
      var collection = this;
      if(!collection.hasOwnProperty('savePosition')) {
        // console.log("Sensors.save() : Running Setup")
        // console.log("collection.models.length is " + collection.models.length)
        collection.savePosition = 0;
      }
      // Run
      if (collection.savePosition > collection.models.length-1) {
        // console.log("Sensors.save() : Ending run with a collection.savePosition of " + collection.savePosition)
        collection.savePosition = 0;
        collection.trigger('sync');
      }
      else {
        // console.log("Sensors.save() : Running with a collection.savePosition of " + collection.savePosition)
        var model = collection.models[collection.savePosition];

        model.on('sync', function() {
          collection.savePosition++;
          collection.save();
        });

        model.save();
      }
    },
    sync: function (method, collection, options) {
      var db = nano.use('config');
      switch (method) {
        case 'read':
          db.view('api', 'Sensors',{"include_docs": true}, function(err, body) {
            collection.models = [];

            _.each(body.rows, function(row) {
              collection.add(row.doc);
            });

            collection.trigger('sync');
          });
          break;
      }
    }
  }),

  SensorsByBeeId: Backbone.Collection.extend({
    model: HiveBackbone.Models.Sensor,
    comparator: 'order',
    params: {
      beeId: null
    },
    sync: function (method, collection, options) {
      var db = nano.use('config');
      switch (method) {
        case 'read':
          //console.log('this.params.beeId:')
          //console.log(this.params.beeId)
          db.view('api', 'SensorsByBeeId',{"include_docs": true, "keys":[this.params.beeId]}, function(err, body) {
            //console.log('body:')
            //console.log(body)
            collection.models = [];

            _.each(body.rows, function(row) {
              collection.add(row.doc);
            });

            collection.trigger('sync');
          });
          break;
      }
    }
  }),

  SwarmsByBeeAddress: Backbone.Collection.extend({
    params: {},
    model: HiveBackbone.Models.Swarm,
    sync: function (method, collection, options) {
      var db = nano.use('swarms')
      switch (method) {
        case 'read':
          //console.log(this.params)
          db.view('api', 'SwarmByBeeAddress',{"keys":[this.params.beeAddress], include_docs:true}, function(err, body) {
            if(body.hasOwnProperty('rows')) {
              body.rows.forEach(function(row) {
                collection.add(row.doc)
              })
            }
            collection.trigger('sync')
          })
          break;
      }
    }
  }),

  UnhatchedEggsByBeeAddress: Backbone.Collection.extend({
    model: HiveBackbone.Models.Egg,
    params: {},
    sync: function (method, collection, options) {
      var db = nano.use('incubator')
      switch (method) {
        case 'read':
          //console.log(this.params)
          db.view('api', 'UnhatchedEggsByBeeAddress',{"keys":[this.params.beeAddress], include_docs:true}, function(err, body) {
            if(body && body.hasOwnProperty('rows')) {
              body.rows.forEach(function(row) {
                if(row.doc.hatched === false) {
                  collection.add(row.doc);
                }
              })
            }
            collection.trigger('sync')
          })
          break;
      }
    }
  })

};
