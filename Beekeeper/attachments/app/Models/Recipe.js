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
      kind: 'Recipe',
      trigger: "UpperAndLowerBounds",
      action: "SendEmail"
    },

    schema: {
      label: 'Text',
      state: {
        type: 'Select',
        options: ['on', 'off']
      },
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
          "@messaging.sprintpcs.com": "Sprint",
          "@vtext.com": "Verizon",
          "@tmomail.net": "T-Mobile",
          "@txt.att.net": "AT&T"
        }
      }
    }

  }) 

})
