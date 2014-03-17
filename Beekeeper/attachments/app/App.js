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

    setBreadcrumb: function() {
      var crumbs = Array.prototype.slice.call(arguments),
          $ul = $('<ul class="breadcrumb"/>'),
          $breadcrumbs = $('.breadcrumb-wrapper'),
          divider = " <span class='divider'>/</span>";

      if (crumbs.length === 0) {
        $breadcrumbs.html('');
      } else {
        var lastCrumb = crumbs.pop(),
            lastLi = '<li class="active">' + lastCrumb[0] + '</li>';

        crumbs.forEach(function(crumb){
          var link = '<a href="' + crumb[1] + '">' + crumb[0] + '</a>',
              li = '<li>' + link + divider + '</li>';
          $ul.append(li);
        });

        $ul.append(lastLi);
        $('.breadcrumb-wrapper').html($ul);
      }
    },

    sampleInterval: 5*60,

    maxPointsOnScreen: 1000



  }))

})
