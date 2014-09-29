$(function() {

  App.Models.Device = Backbone.Model.extend({

    idAttribute: '_id',

    schema: {
      name: 'Text'
    },

    beforeSave: function (key, val, options) {
      var timestamp = Math.round(new Date().getTime() / 1000);
      this.set({updatedAt: timestamp});
    },

    loadDeviceDefinition: function() {
      var device = this,
          deviceDefinitions = new App.Collections.DeviceDefinitionsByFirmwareUUID();

      deviceDefinitions.params.deviceDefinitionFirmwareUUID =  device.get('deviceDefinitionFirmwareUUID');

      deviceDefinitions.on('sync', function() {
        device.deviceDefinition = deviceDefinitions.models[0];
        device.trigger('loadDeviceDefinition:done');
      });

      deviceDefinitions.fetch();
    },

    parameters: function() {
      var device = this;
          data = [],
          parameters = device.deviceDefinition.get('parameters'),
          keys = _.each(parameters, function(input){
            var key = _(_(input.name).slugify()).camelize(),
                units = !!input.units ? (' ' + input.units) : '',
                val = device.get(key);
                value = typeof val !== 'undefined' ? val : '--';

            data.push(_(key).humanize() + ": " + _(value).capitalize() + units);
          });

      return data.join('<br/>');
    },

    save: function (key, val, options) {
     this.beforeSave(key, val, options);
     return Backbone.Model.prototype.save.call(this, key, val, options);
    },

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
