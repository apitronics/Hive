$(function() {

  App.Views.BeeRecipesTable = Backbone.View.extend({

    tagName: "table",

    className: "table table-striped",

    template: $('#template-BeeRecipesTable').html(),

    itemView: 'RecipeRow'

    initialize: function(){
    },

    addOne: function(model){
      var rowView = new App.Views[this.itemView]({model: model})
      rowView.render()  
      this.$el.append(rowView.el)
    },

    addAll: function(){
      this.collection.forEach(this.addOne, this)
    },

    render: function() {
      var vars = {beeId: this.collection.beeId}
      this.$el.append(_.template(this.template, vars))
      this.addAll()
    }

  })

})

