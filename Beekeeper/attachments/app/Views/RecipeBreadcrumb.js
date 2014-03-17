$(function() {

  App.Views.RecipeBreadcrumb = Backbone.View.extend({

    initialize: function (obj) {
      this.bee = obj.bee;
      this.recipe = obj.recipe;
    },

    render: function(){
      var beeId = this.bee.id,
          beeName = this.bee.get('name'),
          isEditMode = !!this.recipe;
          recipeName = (isEditMode ? this.recipe.get('label') : 'New recipe');

      App.setBreadcrumb(['Bees', '#'], [beeName, '#bee/' + beeId], [recipeName]);
    }

  });

});
