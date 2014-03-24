$(function() {

  App.Views.BeeRecipesTable = Backbone.View.extend({

    tagName: "table",

    className: "table table-striped",

    templateHeader: $('#template-BeeRecipesTableHeader').html(),

    template: $('#template-BeeRecipesTable').html(),

    itemView: 'RecipeRow',

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
      var vars = {beeId: this.collection.params.beeId}
      this.$el.before(_.template(this.templateHeader, vars))
      this.$el.append(_.template(this.template, vars))
      this.addAll()
    }

  })

})

