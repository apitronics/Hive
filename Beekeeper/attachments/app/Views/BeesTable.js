$(function() {

  App.Views.BeesTable = Backbone.View.extend({

    tagName: "table",

    className: "table table-striped",

    template: $('#template-BeesTable').html(),

    templateHeader: $('#template-BeesTableHeader').html(),

    initialize: function(){
    },

    addOne: function(model){
      var beeRowView = new App.Views.BeeRow({model: model})
      beeRowView.render()  
      this.$el.append(beeRowView.el)
    },

    addAll: function(){
      this.collection.forEach(this.addOne, this)
    },

    render: function() {
      this.$el.before(_.template(this.templateHeader))
      this.$el.append(_.template(this.template))
      this.addAll()
    }

  })

})

