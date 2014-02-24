var Backbone = require('backbone')
var Settings = require('../../../Settings')
var nano = require('nano')(Settings.CouchDB.URL)

module.exports = function(recipe, callback) {

  var ev = new Backbone.Model()
	
  var timeAgo = ((new Date().getTime())/1000) - Settings.processRecipesFrequencyInMinutes*60
  var now = (new Date().getTime())/1000
  var data = []
  var lowerBound = null
  var upperBound = null

  // Get data
  ev.on('0', function() {
    nano.use('sensor_' + recipe.sensor).list({startkey: timeAgo.toString(), endkey: now.toString(), include_docs:true}, function(err, body) {
      if(body.hasOwnProperty('rows')) {
        body.rows.forEach(function(row) {
          data.push(row.doc.d)
        })
        ev.trigger('1')
      }
    })
  })

  // Find the upper and lower points
  ev.on('1', function(){  
    if(data.length > 0) {
      data.forEach(function(point) {
        if(lowerBound == null && upperBound == null) {
          lowerBound = point
          upperBound = point
        }
        if(lowerBound > point) {
          lowerBound = point
        }
        if(upperBound < point) {
          upperBound = point
        }
      })
     ev.trigger('2')
    }
  })

  // Execute if needed
  ev.on('2', function() {
	  if(lowerBound < recipe.lowerLimit || upperBound > recipe.upperLimit) {
	  	callback({
	  		status: "triggered",
	  		message: 'Your recipe has been triggered. The detected upper bound is ' + upperBound + ' and the lower bound is ' + lowerBound + '.'
	  	})
	  }
	  else {
	  	callback({"status" : "ok"})
	  }
	})

  ev.trigger('0')

}