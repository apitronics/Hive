$(function() {

  App.Views.DeviceRow = Backbone.View.extend({

    tagName: 'tr',

    template : _.template($('#template-DeviceRow').html()),

    render: function () {
      var model = this.model,
          vars = model.toJSON(),
          hasDeviceDefinition = !!model.deviceDefinition,
          name = model.get('name'),
          deviceDefName = (hasDeviceDefinition ? model.deviceDefinition.get('name') : 'Unknown Device'),
          data = model.parameters(),
          automatedAt = model.get('automatedAt');

      vars.automatedAt = !!automatedAt ? ('Synced ' + moment.unix(automatedAt).calendar()) : 'Not synced yet';
      vars.data = data;
      vars.kind = 'Device';
      vars.units = hasDeviceDefinition ? model.deviceDefinition.get('units') : '';
      vars.name = name || deviceDefName;

      this.$el.append(this.template(vars));
    }

  });

});
