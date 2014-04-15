/*
 * Process Recipes.js
 *
 * Sequntially runs ProcessRecipe for all Recipes in database where state == 'on'.
 *
 */

var Backbone = require('backbone')
var _ = require('underscore')
var Settings = require('../../Settings')
var nano = require('nano')(Settings.CouchDB.URL)
var configDb = nano.use('config')
var processRecipe = require('./ProcessRecipe.js')


module.exports = function(callback) {

  var ev = new Backbone.Model()
  var recipes = []

  // Get Recipe docs
  ev.on('0', function() {
    configDb.view('api', 'Recipes', {include_docs:true}, function(err, res) {
      if(err) return callback(err)
      res.rows.forEach(function(row) {
        if (row.doc.state == 'on') recipes.push(row.doc)
      })
      if (recipes.length == 0) return callback(null, 'no recipes to evaluate')
      ev.trigger('1')
    })
  })

  // Evaluate all recipes
  ev.on('1', function() {
    var done = 0
    // Count the recipes as they are done
    var onRecipeDone = function() {
      done++
      if(done == recipes.length) {
        // All triggers have been evaluated
        ev.trigger('2')
      }
    }
    _.each(recipes, function(recipe) {
      processRecipe(recipe, onRecipeDone)
    })
  })

  ev.on('2', function() {
    return callback(null, 'success')
  })

  ev.trigger('0')

}
