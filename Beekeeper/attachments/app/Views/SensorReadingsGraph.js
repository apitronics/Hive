$(function() {

  // To save on memory, don't give this View a collection, it will expect to find
  // a collection at App.sensorReadings.
  App.Views.SensorReadingsGraph = Backbone.View.extend({

    attributes : function() {return {
      class: "View SensorReadingsGraph"
    }},

    template: _.template($("#template-SensorReadingsGraph").html()),

    templateHover: _.template($("#template-SensorReadingsGraphHover").html()),

    events : {
      'click .generate' : 'newDateTimeSpan'
    },

    initialize: function(){

    },

    prepare: function() {
      // Render the template before preparing the data because that prep may take some time
      var vars = {
            startDate: moment.unix(this.collection.params.startDate).format('M/D/YYYY HH:mm'),
            endDate: moment.unix(this.collection.params.endDate).format('M/D/YYYY HH:mm'),
            name: '' //@todo this.sensor.get('name')
          },
          $el = this.$el,
          $graphContainer = $el.children('.graph-container'),
          $graphLoading = $graphContainer.children('.graph-loading');

      $el.html(this.template(vars));

      $el.find('.form-controls input').datetimepicker();

      // Show a spinner until the graph is rendered
      $graphContainer.hide();
      $graphContainer.css({
        height: 400,
        position: 'relative',
        width: '100%'
      });
      $graphContainer.slideDown();

      $graphLoading.hide();
      $graphLoading.css({
        left: ((window.innerWidth/2)-20),
        position: 'absolute',
        top: 175
      });

      $graphLoading.spin({
        lines: 12, // The number of lines to draw
        length: 7, // The length of each line
        width: 4, // The line thickness
        radius: 10, // The radius of the inner circle
        color: '#000', // #rbg or #rrggbb
        speed: 1, // Rounds per second
        trail: 100, // Afterglow percentage
        shadow: true // Whether to render a shadow
      });
      $graphLoading.fadeIn();
    },

    render: function() {
      var sensorReadingsGraph = this
      if (this.collection.models.length == 0) {
        this.$el.children('.graph-container').html('<div class="no-data">No data found for this range.</div>')
        //$('.graph-loading').hide()
        this.trigger('sensorReadingsGraphRendered')
      }
      else {
        // TRANSFORM App.senorReadings.models -> App.sensorReadingsGraph.data
        this.data = []
        console.log("Now tranforming " + sensorReadingsGraph.collection.models.length + " Backbone models to data points.")
        var ts = Math.round((new Date()).getTime() / 1000)
        _.each(sensorReadingsGraph.collection.models, function(reading, i, list) {
          var dataPoint = {
            date: reading.id*1000,
            value: reading.get('d')
          }
          sensorReadingsGraph.data.push(dataPoint)
        })
        console.log("Transformed in " + (Math.round((new Date()).getTime() / 1000) - ts) + " seconds.")
        // GRAPH App.sensorReadingsGraph.data
        console.log("Now graphing " + sensorReadingsGraph.data.length + " data points.")
        var ts = Math.round((new Date()).getTime() / 1000)

        Morris.Line({
          element: 'graph',
          hoverCallback: function(index, options, content) {
            var point = sensorReadingsGraph.data[index],
                datetime = moment(point['date']),
                dataPoint = {
                  datetime: datetime.format(),
                  datetimeVal: datetime.format('LLLL'),
                  unit: sensorReadingsGraph.sensor.sensorDefinition.get('units'),
                  value: +point['value'].toFixed(2)
                },
                $content = sensorReadingsGraph.templateHover(dataPoint);

            return $content;
          },
          data: this.data,
          lineWidth: 0,
          pointSize: 2,
          pointFillColors: ['rgb(108,147,107)'],
          pointStrokeColors: '#000000',
          hideHover: true,
          ymin: sensorReadingsGraph.collection.ymin,
          ymax: sensorReadingsGraph.collection.ymax,
          xkey: 'date',
          ykeys: ['value'],
          labels: ['value'],
          dateFormat: function (x) { return new Date(x).toDateString(); }
        })

        console.log("Graphed in " + (Math.round((new Date()).getTime() / 1000) - ts) + " seconds.")
        // $('.graph-loading').fadeOut() wont' work ever it seems :-/
        $('.graph-loading').hide()
        this.trigger('sensorReadingsGraphRendered')
      }

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

