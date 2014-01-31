 var couchapp = require('couchapp')
  , path = require('path')
  ;

ddoc = { _id:'_design/api' }

ddoc.views = {

  SwarmByBeeAddress: {
    map: function(doc) {
      if(doc.kind == 'Swarm') {
        doc.beeAddresses.forEach(function(beeAddress){
          emit(beeAddress, doc._id)
        })
      }
    }
  },
  
  SwarmsByEmail: {
    map: function(doc) {
      emit(doc.email, doc._id)
    }
  },

  SwarmsByJarKey: {
    map: function(doc) {
      doc.jarKeys.forEach(function(jarKey) {
        emit(jarKey, doc._id)
      })
    }
  }

};

module.exports = ddoc;
