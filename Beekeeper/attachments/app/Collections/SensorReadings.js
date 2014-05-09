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
      var i = 0,
          first = 0,
          ymin,
          ymax,
          diff,
          offset;

      var docs = _.map(response.rows, function(row, index) {
        var data = parseFloat(row.doc.d);
        if(index === 0){
          first = data;
          ymin = data;
          ymax = data;
        }
        if(data < ymin) ymin = data;
        if(data > ymax) ymax = data;
        return row.doc;
      });

      diff = ymax - ymin;
      offset = diff * 0.2;

      this.ymin = Math.floor(ymin - offset);
      this.ymax = Math.ceil(ymax + offset);

      return docs;
    }

  })

})
