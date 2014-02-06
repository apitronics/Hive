$(function() {
  App.Router = new (Backbone.Router.extend({

    routes: {
      '' : 'Bees',
      'bees' : 'Bees',
      'bee/:beeId' : 'Bee',
      'bee/edit/:beeId' : 'BeeForm',
      'sensor/:sensorId/:starteDate/:endDate' : 'BeeSensor',
      'sensor/:sensorId' : 'Sensor',
      'trigger/add/:beeId' : 'TriggerAdd',
      'trigger/:triggerId' : 'Trigger',
      'settings' : 'Settings'
    },

    
    Settings: function() {
      
      var ev = new Backbone.Model()
      
      var settings = new App.Models.Settings()
      var settingsForm = new App.Views.SettingsForm()

      var drives = new App.Collections.Drives()
      var drivesTable = new App.Views.DrivesTable()

      settingsForm.once('done', function() {
        Backbone.history.navigate('', {trigger: true})
      })
      
      App.clear()
      App.append(settingsForm.el)
      App.append(drivesTable.el)

      ev.once('A0', function() {
        settings.fetch({success: function() {
          ev.trigger('A1')
        }})
      })

      ev.once('A1', function() {
        settingsForm.model = settings
        settingsForm.render()
      })

      ev.once('B0', function() {
        drives.on('sync', function() {
            ev.trigger('B1')
        })
        drives.fetch({success: function() {
          ev.trigger('B1')
        }})
      })

      ev.once('B1', function () {
        drivesTable.collection = drives
        drivesTable.render()
      })

      ev.trigger('A0')
      ev.trigger('B0')

    },


    Bees: function() {
        
      App.setTitle('Your Hive')
      
      // setup
      var ev = new Backbone.Model()
      
      var bees = new App.Collections.Bees()
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
      
      App.setTitle('')
      
      //
      // setup
      //
      
      var ev = new Backbone.Model()
      
      var bee = new App.Models.Bee({"_id": beeId})
      var beeSensors = new App.Collections.BeeSensors()
      var beeTriggers = new App.Collections.BeeTriggers()
      
      var beeSensorsTable = new App.Views.BeeSensorsTable()
      var beeTriggersTable = new App.Views.BeeTriggersTable()
      
      App.clear()
      App.append(beeSensorsTable.el)
      App.append(beeTriggersTable.el)
      
      //
      // Thread AX
      //
      
      // Fetch the beeSensors
      ev.once('A0', function() {
        beeSensors.params.beeId = beeId
        beeSensors.fetch({success: function(collection, response, options){
          ev.trigger('A1')
        }})
      })
      
      // Render the beeSensorsTable
      ev.once('A1', function() { 
        beeSensorsTable.collection = beeSensors 
        beeSensorsTable.render()
      })
      
      //
      // Thread BX
      //

      // Fetch the beeTriggers
      ev.once('B0', function() {   
        beeTriggers.params.beeId = beeId
        beeTriggers.fetch({success: function(collection, response, options){
          ev.trigger('B1')
        }})
      })
      
      // Render the beeSensorsTable
      ev.once('B1', function() { 
        beeTriggersTable.collection = beeTriggers 
        beeTriggersTable.render()
      })
      
      ev.once('C0', function() {
        bee.fetch({complete:function(){ ev.trigger('C1')}})
      })
      
      ev.once('C1', function() {
        App.setTitle(bee.get('name'))
      })
      //
      // Trigger threads
      // 
      
      ev.trigger('A0')
      ev.trigger('B0')
      ev.trigger('C0')

    },
    

    BeeForm: function(beeId) {
        
      App.setTitle('')
      
      var bee = new App.Models.Bee()
      var form = new App.Views.BeeForm({model: bee})
      App.$el.children('.body').html(form.el)
      form.once('Form:done', function() {
        Backbone.history.navigate('', {trigger: true})
      })
      if (beeId) {
        bee.id = beeId
        bee.fetch({success: function() {
          form.render()  
        }})
      }
      else {
        form.render()
      }
    },

    Sensor: function(sensorId, startDate, endDate) {
        
      App.setTitle('')
      
      //
      // setup
      //
      
      var ev = new Backbone.Model()
      
      var sensor = new App.Models.Sensor({_id: sensorId})
      App.sensorReadingsGraph = new App.Views.SensorReadingsGraph()
      
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
        sensor.once('loadDefinition:done', function() {
          App.setTitle(sensor.get('name'))
        })
        sensor.loadDefinition()
        App.sensorReadingsGraph.sensor = sensor
        App.sensorReadingsGraph.prepare()
        ev.trigger('2')
      })

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

    TriggerAdd: function(beeId) {
        
      App.setTitle('')
      
      var trigger = new App.Models.Trigger()
      trigger.once('sync', function() {
        Backbone.history.navigate('bee/' + beeId, {trigger: true})
      })
      trigger.set('bee', beeId)
      var beeSensors = new App.Collections.BeeSensors()
      beeSensors.beeId = beeId
      beeSensors.fetch()
      beeSensors.on('sync', function() {
        trigger.schema.sensor.options = _.map(beeSensors.models, function(model) {
          return {val: model.id, label: model.get('name') }
        })
        var triggerForm = new App.Views.TriggerForm({model: trigger})
        triggerForm.render()
        App.$el.children('.body').html(triggerForm.el)
      })
    },

    Trigger: function(triggerId) {
        
      App.setTitle('')
      
      var trigger = new App.Models.Trigger()
      trigger.id = triggerId
      // When the trigger loads, proceed loading the form
      trigger.once('sync', function() {
        // The next time the trigger is saved will be from the form so forward the user
        trigger.once('sync', function() {
          Backbone.history.navigate('bee/' + trigger.get('bee'), {trigger: true})
        })
        var beeSensors = new App.Collections.BeeSensors()
        beeSensors.beeId = trigger.get('bee')
        beeSensors.fetch()
        beeSensors.on('sync', function() {
          trigger.schema.sensor.options = _.map(beeSensors.models, function(model) {
            return {val: model.id, label: model.get('name') }
          })
          var triggerForm = new App.Views.TriggerForm({model: trigger})
          triggerForm.render()
          App.$el.children('.body').html(triggerForm.el)
        })
      })
      trigger.fetch()
    }

  }))

})
