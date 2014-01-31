$(function() {

  App.Views.BeeSensorsTable = Backbone.View.extend({

    tagName: "table",

    className: "table table-striped",

    template: $('#template-BeeSensorsTable').html(),

    initialize: function(){
    },

    addOne: function(model){
      var sensorRowView = new App.Views.SensorRow({model: model})
      sensorRowView.render()  
      this.$el.append(sensorRowView.el)
    },

    addAll: function(){
      this.collection.forEach(this.addOne, this)
    },

    render: function() {
      this.$el.append(_.template(this.template))
      this.addAll()
    }

  })

})

