$(function() {

  App.Collections.Devices = Backbone.Collection.extend({

    comparator: 'order',

    initialize: function() {
      this.params = {
        beeId: null
      };
    },

    url: function() {
      return '/config/_design/api/_view/DevicesByBeeId?include_docs=true&key="' + this.params.beeId + '"';
    },

    parse: function(response) {
      var docs = [];
      _.each(response.rows, function(row) {
        docs.push(row.doc);
      });
      return docs;
    },

    beeId: null,

    model: App.Models.Device,

    loadDeviceDefinitions: function() {
      var collection = this,
          i = 0;

      function loadDeviceDefinition() {
        collection.models[i].on('loadDeviceDefinition:done', function () {
          if (i == collection.models.length-1) {
            collection.trigger('loadDeviceDefinitions:done');
          }
          else {
            i++;
            loadDeviceDefinition();
          }
        });
        collection.models[i].loadDeviceDefinition();
      }
      loadDeviceDefinition();
    }

  });

});
