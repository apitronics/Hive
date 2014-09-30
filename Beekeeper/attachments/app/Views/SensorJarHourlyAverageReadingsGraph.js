$(function() {

  // To save on memory, don't give this View a collection, it will expect to find
  // a collection at App.sensorReadings.
  App.Views.SensorJarHourlyAverageReadingsGraph = Backbone.View.extend({

    attributes : function() {return {id: "graph-" + moment().unix()}},

    template: _.template($("#template-SensorReadingsGraph").html()),

    events : {
      'click .generate' : 'newDateTimeSpan'
    },

    initialize: function(){

    },

    prepare: function() {
      // Render the template before preparing the data because that prep may take some time
      var vars = {
        startDate: moment.unix(App.sensorReadings.params.startDate).format('M/D/YYYY HH:mm'),
        endDate: moment.unix(App.sensorReadings.params.endDate).format('M/D/YYYY HH:mm'),
        name: '' //@todo this.sensor.get('name')
      }
      this.$el.html(this.template(vars))

      this.$el.children('.form-controls').children('input').datetimepicker()

      // Show a spinner until the graph is rendered
      this.$el.children('.graph-container').children('.graph-loading').hide()
      this.$el.children('.graph-container').hide()
      this.$el.children('.graph-container').css('height', '400px')
      this.$el.children('.graph-container').css('width', '100%')
      this.$el.children('.graph-container').css('position', 'relative')
      this.$el.children('.graph-container').slideDown()
      this.$el.children('.graph-container').children('.graph-loading').hide()
      this.$el.children('.graph-container').children('.graph-loading').css('position', 'absolute')
      this.$el.children('.graph-container').children('.graph-loading').css('top', '175px')
      this.$el.children('.graph-container').children('.graph-loading').css('left', (window.innerWidth/2)-20)
      this.$el.children('.graph-container').children('.graph-loading').spin({
        lines: 12, // The number of lines to draw
        length: 7, // The length of each line
        width: 4, // The line thickness
        radius: 10, // The radius of the inner circle
        color: '#000', // #rbg or #rrggbb
        speed: 1, // Rounds per second
        trail: 100, // Afterglow percentage
        shadow: true // Whether to render a shadow
      })
      this.$el.children('.graph-container').children('.graph-loading').fadeIn()
    },

    render: function() {
      // TRANSFORM App.senorReadings.models -> App.sensorReadingsGraph.data
      this.data = []
      console.log("Now tranforming " + App.sensorReadings.models.length + " Backbone models to data points.")
      var ts = Math.round((new Date()).getTime() / 1000)
      _.each(App.sensorReadings.models, function(reading, i, list) {
        var dataPoint = {
          date: reading.id*1000,
          value: reading.get('d')
        }
        App.sensorReadingsGraph.data.push(dataPoint)
      })
      console.log("Transformed in " + (Math.round((new Date()).getTime() / 1000) - ts) + " seconds.")
      // GRAPH App.sensorReadingsGraph.data
      console.log("Now graphing " + App.sensorReadingsGraph.data.length + " data points.")
      var ts = Math.round((new Date()).getTime() / 1000)
      Morris.Line({
        element: 'graph',
        data: this.data,
        lineColors: ['rgb(108,147,107)'],
        lineWidth: 1,
        pointSize: 2,
        pointFillColors: ['rgb(108,147,107)'],
        pointStrokeColors: '#000000',
        hideHover: true,
        ymin: App.sensorReadings.ymin,
        ymax: App.sensorReadings.ymax,
        xkey: 'date',
        ykeys: ['value'],
        labels: ['value'],
        dateFormat: function (x) { return new Date(x).toDateString(); }
      });
      console.log("Graphed in " + (Math.round((new Date()).getTime() / 1000) - ts) + " seconds.")
      // $('.graph-loading').fadeOut() wont' work ever it seems :-/
      $('.graph-loading').hide()
      this.trigger('sensorReadingsGraphRendered')
    },

    newDateTimeSpan: function(){
      App.startDate = (moment(this.$el.children('.form-controls').children('.start-date').val(), 'M/D/YYYY HH:mm').unix())
      App.endDate = (moment(this.$el.children('.form-controls').children('.end-date').val(), 'M/D/YYYY HH:mm').unix())
      // Reload the page
      Backbone.history.stop()
      Backbone.history.start()
    }

  })

})

