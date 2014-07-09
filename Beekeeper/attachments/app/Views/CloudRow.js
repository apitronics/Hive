$(function() {

  App.Views.CloudRow = Backbone.View.extend({

    tagName: 'tr',

    template : _.template($("#template-CloudRow").html()),

    render: function () {
      this.$el.append(this.template(this.model.toJSON()));
    }

  });

});
