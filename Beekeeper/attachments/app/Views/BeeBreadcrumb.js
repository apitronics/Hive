$(function() {

  App.Views.BeeBreadcrumb = Backbone.View.extend({

    initialize: function (obj) {
      this.bee = obj.bee;
      this.mode = obj.mode || null;
    },

    render: function(){
      if(this.mode == 'edit'){
        App.setBreadcrumb(['Bees', '#'], [this.bee.get('name'), '#bee/' + this.bee.id], ['Edit']);
      } else if(this.mode == 'csq') {
        App.setBreadcrumb(['Bees', '#'], [this.bee.get('name'), '#bee/' + this.bee.id], ['CSQ']);
      } else {
        App.setBreadcrumb(['Bees', '#'], [this.bee.get('name')]);
      }
    }

  });

});
