$(function() {

  App.Views.DrivesTable = Backbone.View.extend({

    tagName: "table",

    className: "table table-striped drives",

    template: $('#template-DrivesTable').html(),

    itemView: "DriveRow",

    initialize: function(){
    },

    addItem: function(model){
      var itemView = new App.Views[this.itemView]({model: model})
      itemView.render()
      this.$el.append(itemView.el)
    },

    addAll: function(){
      this.collection.forEach(this.addItem, this)
    },

    render: function() {
      this.$el.append(_.template(this.template))
      this.addAll()
    }

  })

})

