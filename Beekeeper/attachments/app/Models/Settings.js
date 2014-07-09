$(function() {

  App.Models.Settings = Backbone.Model.extend({

    idAttribute: "_id",

    url: function() {
      var url
      if (_.has(this, 'id') && this.get('_rev')) {
        url = '/config/Settings?rev=' + this.get('_rev') // Update, Delete
      }
      else if (_.has(this, 'id') ) {
        url = '/config/Settings' // Read
      }
      else {
        url = '/config/Settings' // Create
      }
      return url
    },

    schema: {
      'gmailUserName': 'Text',
      'gmailPassword': 'Password',
      'gmailEmailAddress': 'Text',
      'cloudUserName': 'Text',
      'cloudPassword': 'Password',
      'saveToCloud': 'Checkbox'
    }

  })

})
