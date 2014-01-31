$(function() {

  App.Collections.Bees = Backbone.Collection.extend({

    url: "/config/_design/api/_view/Bees?include_docs=true",

    parse: function(response) {
      var docs = _.map(response.rows, function(row) {
        return row.doc
      })
      return docs
    },
     
    model: App.Models.Bee,

    comparator: function(model) {
      var name = model.get('name')
      if (name) return name.toLowerCase()
    },


  })

})
