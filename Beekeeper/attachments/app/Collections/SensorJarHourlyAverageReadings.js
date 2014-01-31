$(function() {

  App.Collections.SensorJarHourlyAverageReadings = Backbone.Collection.extend({
    
    initialize: function() {
      this.params = {
        startDate: null, 
        endDate: null, 
        sensorId: null
      }
      this.values = {}
    },

    model: App.Models.Reading, // May not use this

    url: function() {
        var startDate = moment(this.params.startDate.toString(), "X").format("YYYY-MM-DD HH")
        var endDate = moment(this.params.endDate.toString(), "X").format("YYYY-MM-DD HH")
        return '/sensor_' + this.params.sensorId + '__reduced__hourly-average-reduce/_all_docs'
           + '?' 
           + 'startkey="' + startDate + '"' 
           + '&'
           + 'endkey="' + endDate + '"' 
           + '&'
           + 'include_docs=true'

    },

    parse: function(response) {
      // Calculate the min and max of this collection so graphing functions can take advantage of it
      var i = 0
      var first = 0
      var ymin
      var ymax
      var docs = _.map(response.rows, function(row) {
        row.doc.d = row.doc.value
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
        // Map the row object to what the Reading model expects
        return {"_id": moment(row.doc._id, "YYYY-MM-DD HH").unix(), "d": row.doc.value}
      })
      this.ymin = parseInt(ymin - ((ymax-ymin)*(0.2)))
      this.ymax = parseInt(ymax + ((ymax-ymin)*(0.2)))
      
      return docs
    },

  })

})
