$(function() {

  App.Views.SensorBreadcrumb = Backbone.View.extend({

    initialize: function (obj) {
      var isDevice = typeof(obj.device) !== 'undefined',
          isSensor = typeof(obj.sensor) !== 'undefined',
          subObj = (isSensor ? obj.sensor : (isDevice ? obj.device : null)),
          name = isSensor ? (subObj.get('name') || subObj.sensorDefinition.get('name')) : (isDevice ? (subObj.get('name') || subObj.deviceDefinition.get('name')) : 'Unknown'),
          beeId = obj.bee.id,
          beeName = obj.bee.get('name'),
          isEditMode = (obj.mode && obj.mode == 'edit');

      if(isEditMode) {
        App.setBreadcrumb(['Bees', '#'], [beeName, '#bee/' + beeId], [name, '#sensor/' + subObj.id], ['Edit']);
      } else {
        App.setBreadcrumb(['Bees', '#'], [beeName, '#bee/' + beeId], [name]);
      }
    }

  });

});
