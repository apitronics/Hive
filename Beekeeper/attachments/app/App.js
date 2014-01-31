$(function() {

  App = new (Backbone.View.extend({

    Models: {},
    Views: {},
    Collections: {},

    el: "body",

    template: $("#template-app").html(),

    start: function(){
      // Set up a consistent place for placing sensorReadings and sensorReadingsGraph
      // so we don't memory leak
      App.sensorReadingsGraph = new App.Views.SensorReadingsGraph()
      App.sensorReadingsGraph.collection = new App.Collections.SensorReadings()
      // start the app
      this.$el.html(_.template(this.template))
      Backbone.history.start({pushState: false})
    },
    
   
    clear: function() {
      App.$el.children('.body').html('')
    },
    
    append: function(content) {
      App.$el.children('.body').append(content)
    },
    
    setTitle: function(title) {
      $('.brand').text(title)
    },
    
    sampleInterval: 5*60,
    
    maxPointsOnScreen: 1000
    


  }))

})
