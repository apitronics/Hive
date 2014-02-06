$(function() {

  App.Collections.Drives = Backbone.Collection.extend({

    idAttribute: "_id",

    url: function() {
      var url
      if (_.has(this, 'id') && this.get('_rev')) {
        url = 'http://hive.local:8000/config/Settings'//'http://admin:password@hive.local:8000/config/Settings?rev="' + this.get('_rev')
      }
      else {
        url = '/config/drives'
      }
      return url
    },
    
    parse: function(response) {
      var docs = []
      _.each(response , function(value, key, list) {
        if(key != "_id" && key != "_rev") {
          docs.push({
            "name": key,
            "used": value.used,
            "available": value.available
          })
        }
      })
      return docs
    },

    beeId: null, 

    model: App.Models.Drive,

  })

})
