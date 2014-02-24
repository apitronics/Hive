module.exports = function(recipe, callback) {
	
  var anHourAgo = ((new Date().getTime())/1000) - (60*60)
  var data
  var lowerBound
  var upperBound

  // Get data
  ev.on('0', function() {

  })

  // Find the upper and lower points
  ev.on('1', function() {

  })

  // Execute if needed
  ev.on('2', function() {
	  if(lowerBound < trigger.lowerBound || upperBound > trigger.upperBound) {
	  	callback({
	  		status: "triggered",
	  		message: 'Your recipe has been triggered. The detected upper bound is ' + upperBound + ' and the lower bound is ' + lowerBound + '.'
	  	})
	  }
	  else {
	  	callback({"status" : "ok"})
	  }
	})

}