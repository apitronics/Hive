 var couchapp = require('couchapp')
  , path = require('path')
  ;

ddoc = { _id:'_design/api' }

ddoc.views = {
  
  UnhatchedEggsByBeeAddress: {
    map: function(doc) {
    	if(doc.hatched == false){ 
    	  emit(doc.address, doc._id)
    	}
    }
  }

};

module.exports = ddoc;
