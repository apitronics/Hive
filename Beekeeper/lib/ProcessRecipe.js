var HiveBackbone = require('../../HiveBackbone/HiveBackbone.js')
var moment = require('moment')
module.exports = function(recipe, callback) {

	var trigger = require('./triggers/' + recipe.trigger)
	var action = require('./actions/' + recipe.action)

	trigger(recipe, function(info) {
		if (info.status == "triggered") {
      // @todo recipe should have used Backbone Model class to begin with
      var recipeModel = new HiveBackbone.Models.Recipe(recipe)
      recipeModel.setState('triggered')
			action(recipe, info, function() {
				callback()
			})
		}
	})

}
