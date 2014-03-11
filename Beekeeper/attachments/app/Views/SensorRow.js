$(function() {

  App.Views.SensorRow = Backbone.View.extend({

    tagName: "tr",

    template : _.template($("#template-SensorRow").html()),

    render: function () {
      var vars = this.model.toJSON(),
          reading = this.model.lastSensorReading.get('value'),
          timestamp = this.model.lastSensorReading.get('timestamp')
      
      vars.units = this.model.sensorDefinition.get('units')
      
      if (reading) {
        vars.reading = reading
        timestamp = moment.unix(timestamp)
      }
      else {
        vars.reading = '...'
        timestamp = moment()
      }

      vars.timestamp = timestamp.calendar()

      if (!this.model.get('name')) {
        vars.name = this.model.sensorDefinition.get('name')
      }
      this.$el.append(this.template(vars))
    }

  })

})
