$(function() {

  App.Views.SensorRow = Backbone.View.extend({

    tagName: "tr",

    template : _.template($("#template-SensorRow").html()),

    render: function () {
      var vars = this.model.toJSON()
      if (this.model.lastSensorReading.get('value')) {
        vars.reading = this.model.lastSensorReading.get('value')
        vars.timestamp = moment.unix(this.model.lastSensorReading.get('timestamp')).format('h:mm:ss a')
      }
      else {
        vars.reading = "..."
        vars.timestamp = moment().format('h:mm:ss a')
      }
      if (!this.model.get('name')) {
        vars.name = this.model.sensorDefinition.get('name')
      }
      this.$el.append(this.template(vars))
    }

  })

})
