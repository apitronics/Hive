$(function() {

  App.Collections.CloudRows = Backbone.Collection.extend({

    url: '/config/cloud_settings',

    parse: function(response) {
      var docs = [];
      _.each(response , function(value, key, list) {
        if(key != "_id" && key != "_rev") {
          docs.push({
            "key": key,
            "value": value
          });
        }
      });
      return docs;
    },

    model: App.Models.CloudRow

  });

});
