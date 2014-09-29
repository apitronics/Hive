$(function() {

  App.Collections.DeviceDefinitionsByFirmwareUUID = Backbone.Collection.extend({

    initialize: function() {
      this.params = {
        deviceDefinitionFirmwareUUID: null
      }
    },

    url: function() {
      return "/config/_design/api/_view/DeviceDefinitionsByFirmwareUUIDInteger?include_docs=true&key=" + eval(this.params.deviceDefinitionFirmwareUUID)
    },

    parse: function(response) {
      var docs = _.map(response.rows, function(row) {
        return row.doc
      })
      return docs
    },

    model: App.Models.DeviceDefinition,

    comparator: function(model) {
      var name = model.get('name')
      if (name) return name.toLowerCase()
    },


  })

})
