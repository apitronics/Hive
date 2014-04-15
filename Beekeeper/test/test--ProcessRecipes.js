var processRecipes = require('../lib/ProcessRecipes.js')
var log = require('../../util/log.js')

log("ProcessRecipes", "starting")
processRecipes(function(err, message) {
  if (err) log('ProcessRecipes', err)
  if (message) log('ProcessRecipes', message)
  return log('ProcessRecipes', 'done')
})


