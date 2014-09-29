$(function() {

  App.Models.DeviceDefinition = Backbone.Model.extend({

    idAttribute: '_id',

    url: function() {
      var url;
      if (_.has(this, 'id') && _.has(this, '_rev')) {
        url = '/config/' + this.id + "?rev=" + this.get('_rev');
      }
      else if (_.has(this, 'id') ) {
        url = '/config/' + this.id;
      }
      else {
        url = '/config';
      }
      return url;
    }

  });

});
