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
      var i = 0,
          first = 0,
          ymin,
          ymax,
          diff,
          offset;

      var docs = _.map(response.rows, function(row, index) {
        var data = parseFloat(row.doc.value);
        if(index === 0){
          first = data;
          ymin = data;
          ymax = data;
        }
        if(data < ymin) ymin = data;
        if(data > ymax) ymax = data;
        return {"_id": moment(row.doc._id, "YYYY-MM-DD HH").unix(), "d": data};
      });

      diff = ymax - ymin;
      offset = diff * 0.2;

      this.ymin = Math.floor(ymin - offset);
      this.ymax = Math.ceil(ymax + offset);

      return docs;
    }

  })

})
