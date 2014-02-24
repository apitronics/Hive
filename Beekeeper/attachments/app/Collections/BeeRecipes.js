$(function() {

  App.Collections.BeeRecipes = Backbone.Collection.extend({
    
    initialize: function() {
      this.params = {
        beeId: null
      }
    },
    
    model: App.Models.Recipe,

    url: function() {
      return '/config/_design/api/_view/RecipesByBeeId?include_docs=true&key="' + this.params.beeId + '"'
    },

    parse: function(response) {
      var docs = []
      _.each(response.rows, function(row) {
        docs.push(row.doc)
      })
      return docs
    },

    beeId: null

  })

})
