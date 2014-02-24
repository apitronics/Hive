$(function() {

  App.Models.Recipe = Backbone.Model.extend({

    idAttribute: '_id',

    url: function() {
      var url
      if (_.has(this, 'id') && this.get('_rev')) {
        url = '/config/' + this.id + "?rev=" + this.get('_rev')
      }
      else if (_.has(this, 'id') ) {
        url = '/config/' + this.id 
      }
      else {
        url = '/config'
      }
      return url
    },
    
    defaults: {
      kind: 'Recipe'
    },

    schema: {
      label: 'Text',
      beeId: 'Text',
      sensor: { 
        type: 'Select', 
        options: [] 
      },
      kind: 'Hidden',
      upperLimit: 'Number',
      lowerLimit: 'Number',
      alertPhoneNumber: 'Text',
      alertPhoneNumberCarrier: {
        type: "Select",
        options: {
          "Sprint": "@messaging.sprintpcs.com",
          "Verizon":"@vtext.com",
          "T-Mobile": "@tmomail.net",
          "AT&T": "@txt.att.net"
        }
      },
      alertEmail: 'Text',
    }

  }) 

})
