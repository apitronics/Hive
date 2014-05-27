$(function() {

  App.Collections.BeeSensors = Backbone.Collection.extend({

    comparator: 'order',

    initialize: function() {
      this.params = {
        beeId: null
      }
    },

    url: function() {
      return '/config/_design/api/_view/SensorsByBeeId?include_docs=true&key="' + this.params.beeId + '"'
    },

    parse: function(response) {
      var docs = []
      _.each(response.rows, function(row) {
        docs.push(row.doc)
      })
      return docs
    },

    beeId: null,

    model: App.Models.Sensor,

    loadSensorDefinitions: function() {
      var collection = this
      var i = 0
      function loadSensorDefinition() {
        collection.models[i].on('loadSensorDefinition:done', function () {
          if (i == collection.models.length-1) {
            collection.trigger('loadSensorDefinitions:done')
          }
          else {
            i++
            loadSensorDefinition()
          }
        })
        collection.models[i].loadSensorDefinition()
      }
      loadSensorDefinition()
    },

    loadLastSensorReadings: function() {
      var collection = this
      var i = 0
      function loadLastSensorReading() {
        collection.models[i].on('loadLastSensorReading:done', function () {
          if (i == collection.models.length-1) {
            collection.trigger('loadLastSensorReadings:done')
          }
          else {
            i++
            loadLastSensorReading()
          }
        })
        collection.models[i].loadLastSensorReading()
      }
      loadLastSensorReading()
    }


  })

})
