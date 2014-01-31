$(function() {

  App.Views.SensorRow = Backbone.View.extend({

    tagName: "tr",

    template : _.template($("#template-SensorRow").html()),

    render: function () {
      var that = this
      var sensor = this.model
      // Get most recent reading reading for this sensor
      var sensorReadings = new App.Collections.SensorReadings()
      sensorReadings.params.limit = 1
      sensorReadings.params.sensorId = this.model.id
      sensorReadings.on('sync', function() {
        sensor.on('loadDefinition:done', function() {
          var vars = sensor.toJSON()
          if (sensorReadings.models.length > 0) {
            vars.reading = sensorReadings.models[0].get('value')
            vars.timestamp = moment.unix(sensorReadings.models[0].get('timestamp')).format('h:mm:ss a')
          }
          else {
            vars.reading = "..."
            vars.timestamp = moment().format('h:mm:ss a')
          }
          that.$el.append(that.template(vars))
        })
        sensor.loadDefinition()
      })
      sensorReadings.fetch()
    },

  })

})
