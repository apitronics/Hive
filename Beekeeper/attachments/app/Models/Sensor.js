$(function() {

  App.Models.Sensor = Backbone.Model.extend({

    idAttribute: '_id',

    schema: {
      'name': 'Text'
    },

    save: function (key, val, options) {
     this.beforeSave(key, val, options);
     return Backbone.Model.prototype.save.call(this, key, val, options);
    },

    beforeSave: function (key, val, options) {
      var timestamp = Math.round(new Date().getTime() / 1000);
      this.set({updatedAt: timestamp});
    },

    initialize: function() {
      this.sensorDefinition = new App.Models.SensorDefinition()
      this.lastSensorReading = new App.Models.Reading()
    },

    url: function() {
      var url
      if (_.has(this, 'id') && _.has(this, '_rev')) {
        url = '/config/' + this.id + "?rev=" + this.get('_rev')
      }
      else if (_.has(this, 'id') ) {
        url = '/config/' + this.id
      }
      else {
        url = '/config'
      }
      return url
    },

    loadSensorDefinition: function() {
      var sensor = this,
          sensorDefinitions = new App.Collections.SensorDefinitionsByFirmwareUUID();

      sensorDefinitions.params.sensorDefinitionFirmwareUUID =  this.get('sensorDefinitionFirmwareUUID');

      sensorDefinitions.on('sync', function() {
        sensor.sensorDefinition = sensorDefinitions.models[0];
        sensor.trigger('loadSensorDefinition:done');
      });

      sensorDefinitions.fetch();
    },

    loadLastSensorReading: function() {
      var sensor = this
      var sensorReadings = new App.Collections.SensorReadings()
      sensorReadings.params.limit = 1
      sensorReadings.params.sensorId = this.id
      sensorReadings.on('sync', function() {
        if (sensorReadings.models.length > 0) {
          sensor.lastSensorReading = sensorReadings.models[0]
        }
        sensor.trigger('loadLastSensorReading:done')
      })
      sensorReadings.fetch()
    }

  })

})
