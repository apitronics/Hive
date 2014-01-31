$(function() {

  App.Collections.SensorReadings = Backbone.Collection.extend({
    
    initialize: function() {
      this.params = {
        limit: null,
        startDate: null, 
        endDate: null, 
        sensorId: null
      }
    },

    model: App.Models.Reading,

    url: function() {
      if(this.params.limit === null) {
        return '/sensor_' + this.params.sensorId + '/_all_docs'
           + '?' 
           + 'startkey="' + this.params.startDate + '"' 
           + '&'
           + 'endkey="' + this.params.endDate + '"' 
           + '&'
           + 'include_docs=true'//&reduce_to=100'
      }
      else {
        return '/sensor_' + this.params.sensorId + '/_all_docs' + '?startkey="FFFFF"&endkey=""&limit=1&descending=true&include_docs=true' 
      }
    },

    parse: function(response) {
      // Calculate the min and max of this collection so graphing functions can take advantage of it
      var i = 0
      var first = 0
      var ymin
      var ymax
      var docs = _.map(response.rows, function(row) {
        if(i == 0) {
          first = row.doc.d
        }
        else if (i == 1) {
          if (row.doc.d < first) {
            ymin = row.doc.d
            ymax = first
          }
          else {
            ymin = first
            ymax = row.doc.d
          }
        }
        else if (i > 1) {
          if(row.doc.d < ymin) {
            ymin = row.doc.d
          }
          else if (row.doc.d > ymax) {
            ymax = row.doc.d
          }
        }
        i++
        return row.doc
      })
      this.ymin = parseInt(ymin - ((ymax-ymin)*(0.2)))
      this.ymax = parseInt(ymax + ((ymax-ymin)*(0.2)))
      
      return docs
    },

  })

})
