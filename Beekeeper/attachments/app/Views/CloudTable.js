$(function() {

  App.Views.CloudTable = Backbone.View.extend({

    tagName: "table",

    className: "table table-striped cloud",

    template: $('#template-CloudTable').html(),

    itemView: "CloudRow",

    initialize: function(){
    },

    addOne: function(model){
      var itemView = new App.Views[this.itemView]({model: model});
      itemView.render();
      this.$el.append(itemView.el);
    },

    addAll: function(){
      this.collection.forEach(this.addOne, this);
    },

    render: function() {
      this.$el.append(_.template(this.template));
      this.addAll();
    }

  });

});
