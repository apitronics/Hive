$(function() {

  App.Models.Settings = Backbone.Model.extend({

    // An override for compatibility with CouchDB
    idAttribute: "_id",

    // An override for compatibility with CouchDB
    url: function() {
      var url
      if (_.has(this, 'id') && this.get('_rev')) {
        url = '/config/Settings'//'http://admin:password@hive.local:8000/config/Settings?rev="' + this.get('_rev')
      }
      else {
        url = '/config/Settings'
      }
      return url
    },

    schema: {
      'gmailUserName': 'Text',
      'gmailPassword': 'Text',
      'gmailEmailAddress': 'Text',
      'sendAlertsTo': 'Text'
    }    

  })

})
