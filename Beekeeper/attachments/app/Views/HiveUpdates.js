$(function() {

  App.Views.HiveUpdates = Backbone.View.extend({

    initialize: function() {
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);
    },

    template : _.template($('#template-HiveUpdates').html()),

    render: function () {
      vars = {}
      var updates = this.model.get('updates')
      if (updates.length > 0) {
        vars.info = 'Update Hive (' + updates.length + ')'
        this.$el.html(this.template(vars))
      }
      else {
        this.$el.html()
      }
    },

  })

})
