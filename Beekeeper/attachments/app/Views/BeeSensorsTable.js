$(function() {

  App.Views.BeeSensorsTable = Backbone.View.extend({

    template: $('#template-BeeSensorsTable').html(),

    itemViewContainer: 'table',

    initialize: function(){
    },

    addOne: function(model){
      var sensorRowView = new App.Views.SensorRow({model: model});
      sensorRowView.render();
      this.$el.find(this.itemViewContainer).append(sensorRowView.el);
    },

    addAll: function(){
      this.collection.forEach(this.addOne, this);
    },

    render: function() {
      this.$el.html(_.template(this.template));
      this.addAll();
      $('.edit-bee').attr('href', '#bee/edit/' + this.beeId);
      $('.download-csv').attr('href', 'http://' + location.hostname + ':8800/download?beeId=' + this.beeId);
    }

  });

});

