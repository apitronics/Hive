$(function() {
  App.Router = new (Backbone.Router.extend({

    routes: {
      '' : 'Bees',
      'bees' : 'Bees',
      'bee/:beeId' : 'Bee',
      'bee/edit/:beeId' : 'BeeForm',
      'device/edit/:beeId/:deviceId' : 'DeviceForm',
      'sensor/:sensorId' : 'Sensor',
      'sensor/edit/:beeId/:sensorId' : 'SensorForm',
      'recipe/add/:beeId' : 'RecipeAdd',
      'recipe/:triggerId' : 'Recipe',
      'settings' : 'Settings'
    },


    Settings: function() {

      var ev = new Backbone.Model(),
          settings = new App.Models.Settings(),
          settingsForm = new App.Views.SettingsForm(),
          settingsBreadcrumb = new App.Views.SettingsBreadcrumb();
          drives = new App.Collections.Drives(),
          drivesTable = new App.Views.DrivesTable(),
          cloudRows = new App.Collections.CloudRows(),
          cloudTable = new App.Views.CloudTable();

      settingsForm.once('done', function() {
        Backbone.history.navigate('', {trigger: true});
      });

      App.clear();

      App.append(settingsForm.el);
      App.append(drivesTable.el);
      App.append(cloudTable.el);

      ev.once('A0', function() {
        settings.fetch({success: function() {
          ev.trigger('A1');
        }});
      });

      ev.once('A1', function() {
        settingsForm.model = settings;
        settingsForm.render();

        if(settings.toJSON().saveToCloud){
          cloudRows.fetch({success: function(){
            cloudTable.collection = cloudRows;
            cloudTable.render();
          }});
        }
      });

      ev.once('B0', function() {
        drives.fetch({success: function() {
          ev.trigger('B1');
        }});
      });

      ev.once('B1', function () {
        drivesTable.collection = drives;
        drivesTable.render();
      });

      ev.trigger('A0')
      ev.trigger('B0')

    },

    DeviceForm: function(beeId, deviceId) {
      var ev = new Backbone.Model(),
          modelId = deviceId,
          modelClass = 'Device',
          formClass = 'DeviceForm',
          redirect = 'bee/' + beeId;
          model = new App.Models[modelClass](),
          form = new App.Views[formClass]({model: model}),
          bee = new App.Models.Bee({_id: beeId}),
          deviceLoaded = false,
          beeLoaded = false;

      App.$el.children('.body').html(form.el);

      form.once('Form:done', function() {
        Backbone.history.navigate(redirect, {trigger: true});
      });

      if (modelId) {
        model.id = modelId;
        model.fetch({success: function() {
          model.once('loadDeviceDefinition:done', function(){
            deviceLoaded = true;
            ev.trigger('addBreadcrumb');
          });

          model.loadDeviceDefinition();

          form.render();
        }});
      }
      else {
        form.render();
      }

      bee.fetch({complete: function(){
        beeLoaded = true;
        ev.trigger('addBreadcrumb');
      }});

      ev.on('addBreadcrumb', function(){
        if(beeLoaded && deviceLoaded) {
          new App.Views.SensorBreadcrumb({device: model, bee: bee});
        }
      });
    },

    Bees: function() {

      // setup
      var ev = new Backbone.Model()

      var bees = new App.Collections.Bees()
      var beesBreadcrumb = new App.Views.BeesBreadcrumb()
      var beesTable = new App.Views.BeesTable()

      App.clear()
      App.append(beesTable.el)

      // Fetch the Bees Collection and give it to beesTable
      ev.once('0', function() {
        bees.fetch({success: function(collection, response, options){
          beesTable.collection = bees
          ev.trigger('1')
        }})
      })

      // Render the beesTable View
      ev.once('1', function() {
        beesTable.render()
      })

      ev.trigger('0')

    },


    Bee: function(beeId) {
      //
      // setup
      //

      var ev = new Backbone.Model(),
          bee = new App.Models.Bee({"_id": beeId}),
          beeCsq = new App.Models.Csq(),
          beeCsqView = new App.Views.BeeCsq({csq: beeCsq}),
          beeDevices = new App.Collections.Devices(),
          beeDevicesTable = new App.Views.DevicesTable(),
          beeBreadcrumb = new App.Views.BeeBreadcrumb({bee: bee}),
          beeRecipes = new App.Collections.BeeRecipes(),
          beeRecipesTable = new App.Views.BeeRecipesTable(),
          beeSensors = new App.Collections.BeeSensors(),
          beeSensorsTable = new App.Views.BeeSensorsTable();

      App.clear();
      App.append(beeSensorsTable.el);
      App.append(beeDevicesTable.el);
      App.append(beeRecipesTable.el);
      App.append(beeCsqView.el);

      //
      // Thread AX - Sensors
      //

      // Fetch the beeSensors
      ev.once('A0', function() {
        beeSensors.params.beeId = beeId
        beeSensors.fetch({success: function(collection, response, options){
          ev.trigger('A3')
          ev.trigger('A1')
          ev.trigger('A2')
        }})
      })

      // Fetch the bee devices
      ev.once('D0', function() {
        beeDevices.params.beeId = beeId;
        beeDevices.fetch({success: function(collection, response, options){
          ev.trigger('D1');
        }});
      });

      ev.once('D1', function() {
        beeDevices.once('loadDeviceDefinitions:done', function() {
          ev.trigger('D2');
        });
        beeDevices.loadDeviceDefinitions();
      });

      // Render the bee devices table
      ev.on('D2', function() {
        beeDevicesTable.beeId = beeId;
        beeDevicesTable.collection = beeDevices;
        beeDevicesTable.render();
      });

      ev.once('A1', function() {
        beeSensors.once('loadSensorDefinitions:done', function() {
          ev.trigger('A3')
        })
        beeSensors.loadSensorDefinitions()
      })

      ev.once('A2', function() {
        beeSensors.once('loadLastSensorReadings:done', function() {
          ev.trigger('A3')
        })
        beeSensors.loadLastSensorReadings()
      })

      // Render the beeSensorsTable
      ev.on('A3', function() {
        beeSensorsTable.beeId = beeId
        beeSensorsTable.collection = beeSensors
        beeSensorsTable.render()
      })

      //
      // Thread BX - Recipes
      //

      // Fetch the beeRecipes
      ev.once('B0', function() {
        beeRecipes.params.beeId = beeId
        beeRecipes.fetch({success: function(collection, response, options){
          ev.trigger('B1')
        }})
      })

      // Render the beeSensorsTable
      ev.once('B1', function() {
        beeRecipesTable.collection = beeRecipes
        beeRecipesTable.render()
      })

      //
      // Thread CX - The Bee

      ev.once('C0', function() {
        bee.fetch({complete:function(){ ev.trigger('C1')}})
      })

      ev.once('C1', function() {
        beeBreadcrumb.render()
        ev.trigger('C2');
      })

      ev.once('C2', function() {
        if(!!bee.get('csq')) {
          var beeCsq = new App.Models.Csq();

          beeCsq.id = bee.get('address').replace(/[^a-z0-9]/gi,'');

          beeCsq.fetch({complete: function(){
            beeCsqTable = new App.Views.BeeCsqTable({bee: bee, csq: beeCsq});
            beeCsqTable.render();
            App.append(beeCsqTable.el);
          }});
        }
      });

      //
      // threads
      //

      ev.trigger('A0');
      ev.trigger('B0');
      ev.trigger('C0');
      ev.trigger('D0');

    },

    BeeCsq: function(beeId) {
      var ev = new Backbone.Model(),
          bee = new App.Models.Bee({_id: beeId}),
          beeBreadcrumb = new App.Views.BeeBreadcrumb({bee: bee, mode: 'csq'}),
          beeCsq = new App.Models.Csq({noLimit: true});

      App.clear();

      ev.once('start', function() {
        bee.fetch({complete:function(){ ev.trigger('breadcrumb')}})
      });

      ev.once('breadcrumb', function() {
        beeBreadcrumb.render();
        ev.trigger('csq');
      })

      ev.once('csq', function() {
        if(!!bee.get('csq')) {
          beeCsq.id = bee.get('address').replace(/[^a-z0-9]/gi,'');
          beeCsq.fetch({complete: function(){
            beeCsqTable = new App.Views.BeeCsqTable({bee: bee, csq: beeCsq});
            beeCsqTable.render();
            App.append(beeCsqTable.el);
          }});
        }
      });

      ev.trigger('start');
    },

    BeeForm: function(beeId) {

      var bee = new App.Models.Bee()
      var form = new App.Views.BeeForm({model: bee})
      var beeBreadcrumb = new App.Views.BeeBreadcrumb({bee: bee, mode: 'edit'})

      App.$el.children('.body').html(form.el)
      form.once('Form:done', function() {
        Backbone.history.navigate('', {trigger: true})
      })
      if (beeId) {
        bee.id = beeId
        bee.fetch({success: function() {
          form.render()
          beeBreadcrumb.render()
        }})
      }
      else {
        form.render()
      }
    },


    SensorForm: function(beeId, sensorId) {
      var modelId = sensorId
      var modelClass = 'Sensor'
      var formClass = 'SensorForm'
      redirect = 'bee/' + beeId

      // Boiler Backbone.js helper code for a Form Route to do CRUD operations on a Model.
      // https://gist.github.com/rjsteinert/9494916
      var model = new App.Models[modelClass]()
      var form = new App.Views[formClass]({model: model})
      App.$el.children('.body').html(form.el)
      form.once('Form:done', function() {
        Backbone.history.navigate(redirect, {trigger: true})
      })
      if (modelId) {
        model.id = modelId
        model.fetch({success: function() {
          model.loadSensorDefinition()
          form.render()
        }})
      }
      else {
        form.render()
      }

      model.once('loadSensorDefinition:done', function() {
        var bee = new App.Models.Bee({_id: beeId});

        bee.fetch({complete: function(){
          var sensorBreadcrumb = new App.Views.SensorBreadcrumb({sensor: model, bee: bee, mode: 'edit'});
        }});

      })
    },


    Sensor: function(sensorId, startDate, endDate) {
      //
      // setup
      //

      var ev = new Backbone.Model()

      var sensor = new App.Models.Sensor({_id: sensorId})
      App.sensorReadingsGraph = new App.Views.SensorReadingsGraph()

      var bee

      App.clear()
      App.append(App.sensorReadingsGraph.el)

      //
      // Figure out which collection to use
      //

      // Figure out the range parameters for the Collection...

      // ... from URL
      if (startDate && endDate) {
        App.startDate = startDate
        App.endDate = endDate
      }
      // ... from fallback Defaults
      else if (!App.startDate && !App.endDate) {
        // Last 24 hours from now
        App.startDate = moment().unix()-(60*60*24*1)
        App.endDate = moment().unix()
      }

      // Estimate the points we'll receive given the date range we now know of
      var estimatedPointsOnScreenUnreduced = (App.endDate - App.startDate) / App.sampleInterval

      // Now we can set the Collection on the View
      if (estimatedPointsOnScreenUnreduced > App.maxPointsOnScreen) {
        App.sensorReadingsGraph.collection = new App.Collections.SensorJarHourlyAverageReadings()
      }
      else {
        App.sensorReadingsGraph.collection = new App.Collections.SensorReadings()
      }

      // Set params for the Collection
      App.sensorReadingsGraph.collection.params.startDate = App.startDate
      App.sensorReadingsGraph.collection.params.endDate = App.endDate
      App.sensorReadingsGraph.collection.params.sensorId = sensorId

      // Fetch Sensor
      ev.once('0', function() {
        sensor.on('sync', function() {
          ev.trigger('1')
        })
        sensor.fetch()
      })

      // Assign the sensor to its graph and prepare with spinner
      ev.once('1', function() {
        sensor.once('loadSensorDefinition:done', function() {
          ev.trigger('1a')
        })
        sensor.loadSensorDefinition()
        App.sensorReadingsGraph.sensor = sensor
        App.sensorReadingsGraph.prepare()
        ev.trigger('2')
      })

      // Fetch Bee for breadcrumb
      ev.once('1a', function() {
        bee = new App.Models.Sensor({_id: sensor.get('beeId')})
        bee.fetch({complete:function(){ ev.trigger('1b')}})
      });

      ev.once('1b', function(){
        var sensorBreadcrumb = new App.Views.SensorBreadcrumb({sensor: sensor, bee: bee})
      });

      // Fetch the sensorReadings Collection
      ev.once('2', function() {
        App.sensorReadingsGraph.collection.on('sync', function() {
          ev.trigger('3')
        })
        App.sensorReadingsGraph.collection.fetch()
      })

      // Render the graph View
      ev.once('3', function() {
        App.sensorReadingsGraph.render()
      })

      ev.trigger('0')


    },

    RecipeAdd: function(beeId) {


      var ev = new Backbone.Model()

      var recipe = new App.Models.Recipe()
      var recipeForm = new App.Views.RecipeForm({model: recipe})
      var beeSensors = new App.Collections.BeeSensors()
      var bee = new App.Models.Bee({_id: beeId})

      var recipeBreadcrumb = new App.Views.RecipeBreadcrumb({bee: bee})

      bee.fetch({complete: function(){
        recipeBreadcrumb.render()
      }});

      beeSensors.params.beeId = beeId
      recipe.set('beeId', beeId)

      App.clear()
      App.append(recipeForm.el)

      recipeForm.once('done', function() {
        Backbone.history.navigate('bee/' + beeId, {trigger: true})
      })

      ev.once('0', function() {
        beeSensors.on('sync', function() {
          ev.trigger('1')
        })
        beeSensors.fetch()
      })

      ev.once('1', function() {
        beeSensors.on('loadSensorDefinitions:done', function() {
          ev.trigger('2')
        })
        beeSensors.loadSensorDefinitions()
      })

      ev.once('2', function() {
        recipe.schema.sensor.options = _.map(beeSensors.models, function(model) {
          if(model.get('name'))
            return {val: model.id, label: model.get('name') }
          else
            return {val: model.id, label: model.sensorDefinition.get('name') }
        })
        recipeForm.render()
      })

      ev.trigger('0')
    },

    Recipe: function(recipeId) {

      var ev = new Backbone.Model()

      var recipe = new App.Models.Recipe()
      var beeSensors = new App.Collections.BeeSensors()
      var recipeForm = new App.Views.RecipeForm({model: recipe})

      var bee = new App.Models.Bee()
      var recipeBreadcrumb = new App.Views.RecipeBreadcrumb({bee: bee, recipe: recipe})

      recipe.id = recipeId

      App.clear()
      App.append(recipeForm.el)


      recipeForm.once('done', function() {
        Backbone.history.navigate('bee/' + recipe.get('beeId'), {trigger: true})
      })

      ev.once('0', function() {
        recipe.once('sync', function() {
          ev.trigger('1')
          ev.trigger('1a')
        })
        recipe.fetch()
      })

      ev.once('1', function() {
        beeSensors.params.beeId = recipe.get('beeId')
        beeSensors.on('sync', function() {
          ev.trigger('2')
        })
        beeSensors.fetch()
      })

      ev.once('1a', function(){
        bee.id = recipe.get('beeId');
        bee.fetch({complete: function(){
          recipeBreadcrumb.render();
        }})
      })

      ev.once('2', function() {
        beeSensors.on('loadSensorDefinitions:done', function() {
          ev.trigger('3')
        })
        beeSensors.loadSensorDefinitions()
      })

      ev.once('3', function() {
        recipe.schema.sensor.options = _.map(beeSensors.models, function(model) {
          if(model.get('name'))
            return {val: model.id, label: model.get('name') }
          else
            return {val: model.id, label: model.sensorDefinition.get('name') }
        })
        recipeForm.render()
      })

      ev.trigger('0')

    }

  }))

})
