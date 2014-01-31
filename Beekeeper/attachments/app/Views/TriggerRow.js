$(function() {

  App.Views.TriggerRow = Backbone.View.extend({

    tagName: "tr",

    template : _.template($("#template-TriggerRow").html()),

    render: function () {
      var vars = this.model.toJSON()
      this.$el.append(this.template(vars))
    },

  })

})
