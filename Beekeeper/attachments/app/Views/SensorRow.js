$(function() {

  App.Views.SensorRow = Backbone.View.extend({

    tagName: "tr",

    template : _.template($("#template-SensorRow").html()),

    render: function () {
      var vars = this.model.toJSON(),
          reading = this.model.lastSensorReading.get('value'),
          timestamp = this.model.lastSensorReading.get('timestamp');

      vars.units = this.model.sensorDefinition.get('units');

      if (reading !== null) {
        vars.reading = +reading.toFixed(2);
        vars.timestamp = moment.unix(timestamp).calendar();
      }
      else {
        vars.reading = '';
        vars.timestamp = '';
        vars.units = '';
      }

      if (!this.model.get('name')) {
        vars.name = this.model.sensorDefinition.get('name')
      }
      this.$el.append(this.template(vars))
    }

  })

})
