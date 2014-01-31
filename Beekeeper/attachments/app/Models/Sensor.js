$(function() {

  App.Models.Sensor = Backbone.Model.extend({

    idAttribute: '_id',

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

    loadDefinition: function() {
      var sensorDefinitions = new App.Collections.SensorDefinitionsByFirmwareUUID()
      console.log(this.toJSON())
      sensorDefinitions.params.sensorDefinitionFirmwareUUID =  this.get('sensorDefinitionFirmwareUUID')
      var that = this
      sensorDefinitions.on('sync', function() {
        console.log('loaded!')
        that.set('name', sensorDefinitions.models[0].get('name'))
        that.trigger('loadDefinition:done')
      })
      sensorDefinitions.fetch()
    }

  }) 

})
