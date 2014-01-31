$(function() {

  App.Views.BeeTriggersTable = Backbone.View.extend({

    tagName: "table",

    className: "table table-striped",

    template: $('#template-BeeTriggersTable').html(),

    initialize: function(){
    },

    addOne: function(model){
      var triggerRowView = new App.Views.TriggerRow({model: model})
      triggerRowView.render()  
      this.$el.append(triggerRowView.el)
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

