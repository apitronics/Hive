$(function() {

  App.Views.RecipeRow = Backbone.View.extend({

    tagName: "tr",

    template : _.template($("#template-RecipeRow").html()),

    render: function () {
      var vars = this.model.toJSON()
      if (vars.hasOwnProperty('lastTriggered')) {
      	vars.lastTriggered = moment.unix(parseInt(vars.lastTriggered)).format('YYYY-MM-DD @ hh:mm a')
      }
      else {
      	vars.lastTriggered = '...'
      }
      this.$el.append(this.template(vars))
    },

  })

})
