$(function() {

  App.Collections.SensorDefinitionsByFirmwareUUID = Backbone.Collection.extend({

    initialize: function() {
      this.params = {
        sensorDefinitionFirmwareUUID: null
      }
    },

    url: function() {
      return "/config/_design/api/_view/SensorDefinitionsByFirmwareUUIDInteger?include_docs=true&key=" + eval(this.params.sensorDefinitionFirmwareUUID)
    },

    parse: function(response) {
      var docs = _.map(response.rows, function(row) {
        return row.doc
      })
      return docs
    },
     
    model: App.Models.SensorDefinition,

    comparator: function(model) {
      var name = model.get('name')
      if (name) return name.toLowerCase()
    },


  })

})
