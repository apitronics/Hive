module.exports = function(recipe, callback) {

	var trigger = require('./triggers/' + recipe.trigger)
	var action = require('./actions/' + recipe.action)

	trigger(recipe, function(info) {
		if (info.status == "triggered") {
			action(recipe, info, function() {
				callback()
			})
		}
	})

}
