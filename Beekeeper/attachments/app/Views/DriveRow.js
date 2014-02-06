$(function() {

  App.Views.DriveRow = Backbone.View.extend({

    tagName: "tr",

    template : _.template($("#template-DriveRow").html()),

    render: function () {
      this.$el.append(this.template(this.model.toJSON()))
    },

  })

})
