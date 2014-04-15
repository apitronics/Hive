var HiveBackbone = require('../../HiveBackbone/HiveBackbone.js')
var moment = require('moment')
module.exports = function(recipe, callback) {

  // Get the trigger and action for this recipe
	var trigger = require('./triggers/' + recipe.trigger)
	var action = require('./actions/' + recipe.action)

  // Run the trigger
	trigger(recipe, function(results) {
    // See if our trigger got triggered
    if (results.status == "triggered") {
      // @todo recipe should have used Backbone Model class to begin with
      var recipeModel = new HiveBackbone.Models.Recipe(recipe)
      recipeModel.set('lastTriggered', moment().utc().unix())
      recipeModel.set('state', 'off')
      recipeModel.on('sync', function() {
        // Run the action
        action(recipe, results, function(err, message) {
          return callback(err, message)
        })
      })
      recipeModel.save()
		}
    else {
      return callback(null, 'not triggered')
    }
	})

}
