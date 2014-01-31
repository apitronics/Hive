 var couchapp = require('couchapp')
  , path = require('path')
  ;

ddoc = { _id:'_design/api' }

ddoc.views = {
  
  Bees: {
    map: function(doc) {
      if (doc.kind == 'Bee') {
        emit(doc._id, true)
      }
    }
  },

  BeesByAddress: {
    map: function(doc) {
      if (doc.kind == 'Bee') {
        emit(doc.address, doc._id)
      }
    }
  },


  SensorsByBeeId: {
    map: function(doc) {
      if (doc.kind == 'Sensor') {
        emit(doc.beeId, doc._id)
      }
    }
  },

  TriggersByBeeId: {
    map: function(doc) {
      if (doc.kind == 'Trigger') {
        emit(doc.beeId, true)
      }
    }
  },

  Sensors: {
    map: function(doc) {
      if (doc.kind == 'Sensor') {
        emit(doc._id, true)
      }
    }
  },

  SensorDefinitions: {
    map: function(doc) {
      if (doc.kind == 'SensorDefinition') {
        emit(doc._id, true)
      }
    }
  },

  SensorDefinitionsByFirmwareUUIDs: {
    map: function(doc) {
      if (doc.kind == 'SensorDefinition') {
        emit(doc.firmwareUUID, true)
      }
    }
  },

  SensorDefinitionsByFirmwareUUIDInteger: {
    map: function(doc) {
      if (doc.kind == 'SensorDefinition') {
        emit(eval(doc.firmwareUUID), true)
      }
    }
  }


};

module.exports = ddoc;
