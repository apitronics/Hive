$(function() {

  App.Views.HiveUpdates = Backbone.View.extend({

    initialize: function() {
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);
    },

    events: {
      'click .hive-updates-available': 'confirmUpdate'
    },

    template : _.template($('#template-HiveUpdates').html()),

    render: function () {
      var vars = {},
          updates = this.model.get('updates');

      if (updates.length > 0) {
        vars.info = 'Update Hive (' + updates.length + ')';
        this.$el.html(this.template(vars));
      }
      else {
        this.$el.html();
      }
    },

    confirmUpdate: function() {
      return confirm('Are you sure you want to download the latest codebase and update the Hive?');
    }


  });

});
