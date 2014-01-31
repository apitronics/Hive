$(function() {

  App.Collections.Sensors = Backbone.Collection.extend({

    url: function() {
      return "/readings/_all_docs?starkey=" + this.sensorId + this.startDate + '&endkey=' + this.sensorId + this.endDate
    },

    parse: function(response) {
      var docs = _.map(response.rows, function(row) {
        return row.doc
      })
      return docs
    },

    startDate: "0",

    endDate: "99999999999999",

    sensorId: null,

    model: App.Models.Sensor,

    comparator: function(model) {
      var name = model.get('name')
      if (name) return name.toLowerCase()
    },

  })

})
