$(function() {

  App.Collections.BeeSensors = Backbone.Collection.extend({
    
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

    comparator: function(model) {
      var name = model.get('name')
      if (name) return name.toLowerCase()
    },


  })

})
