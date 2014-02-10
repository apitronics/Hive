$(function() {

  App.Views.RecipeRow = Backbone.View.extend({

    tagName: "tr",

    template : _.template($("#template-RecipeRow").html()),

    render: function () {
      var vars = this.model.toJSON()
      this.$el.append(this.template(vars))
    },

  })

})
