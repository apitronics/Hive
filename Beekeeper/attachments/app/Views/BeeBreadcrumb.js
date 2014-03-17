$(function() {

  App.Views.BeeBreadcrumb = Backbone.View.extend({

    initialize: function (obj) {
      this.bee = obj.bee;
      this.mode = obj.mode;
    },

    render: function(){
      if(this.mode && this.mode == 'edit'){
        App.setBreadcrumb(['Bees', '#'], [this.bee.get('name'), '#bee/' + this.bee.id], ['Edit']);
      } else {
        App.setBreadcrumb(['Bees', '#'], [this.bee.get('name')]);
      }
    }

  });

});
