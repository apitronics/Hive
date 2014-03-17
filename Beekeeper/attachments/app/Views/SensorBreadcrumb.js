$(function() {

  App.Views.SensorBreadcrumb = Backbone.View.extend({

    initialize: function (obj) {
      var sensorName = obj.sensor.get('name') || obj.sensor.sensorDefinition.get('name'),
          beeId = obj.bee.id,
          beeName = obj.bee.get('name'),
          isEditMode = (obj.mode && obj.mode == 'edit');

      if(isEditMode){
        App.setBreadcrumb(['Bees', '#'], [beeName, '#bee/' + beeId], [sensorName, '#sensor/' + obj.sensor.id], ['Edit']);
      } else {
        App.setBreadcrumb(['Bees', '#'], [beeName, '#bee/' + beeId], [sensorName]);
      }
    }

  });

});
