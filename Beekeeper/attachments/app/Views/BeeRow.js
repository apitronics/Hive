$(function() {

  App.Views.BeeRow = Backbone.View.extend({

    tagName: "tr",

    template : _.template($("#template-BeeRow").html()),

    render: function () {
      this.$el.append(this.template(this.model.toJSON()))
    },

  })

})
