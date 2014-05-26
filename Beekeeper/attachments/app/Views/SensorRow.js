$(function() {

  App.Views.SensorRow = Backbone.View.extend({

    tagName: "tr",

    template : _.template($("#template-SensorRow").html()),

    render: function () {
      var model = this.model,
          vars = model.toJSON(),
          lastSensorReading = model.lastSensorReading,
          reading = lastSensorReading.get('value'),
          timestamp = lastSensorReading.get('timestamp'),
          hasSensorDefinition = !!model.sensorDefinition;

      vars.units = hasSensorDefinition ? model.sensorDefinition.get('units') : '';
      vars.name = hasSensorDefinition ? model.sensorDefinition.get('name') : 'unknown sensor';

      if ((typeof(reading) !== 'undefined') && (reading !== null)) {
        vars.reading = +reading.toFixed(2);
        vars.timestamp = moment.unix(timestamp).calendar();
      } else {
        vars.reading = '';
        vars.timestamp = '';
        vars.units = '';
      }

      this.$el.append(this.template(vars));
    }

  });

});
