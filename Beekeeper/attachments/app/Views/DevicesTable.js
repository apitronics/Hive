$(function() {

  App.Views.DevicesTable = Backbone.View.extend({

    template: $('#template-DevicesTable').html(),

    itemViewContainer: 'table',

    initialize: function(){
    },

    addOne: function(model){
      var deviceRowView = new App.Views.DeviceRow({model: model});
      deviceRowView.render();
      this.$el.find(this.itemViewContainer).append(deviceRowView.el);
    },

    addAll: function(){
      this.collection.forEach(this.addOne, this);
    },

    render: function() {
      this.$el.html(_.template(this.template));
      this.addAll();
    }

  });

});

