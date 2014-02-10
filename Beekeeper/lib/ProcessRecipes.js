var nodemailer = require('nodemailer')
var Backbone = require('backbone')
var Settings = require('../../Settings')
var nano = require('nano')(Settings.CouchDB.URL)
var configDb = nano.db('config')
var evaluateTrigger = require('./evaluateTrigger.js')

module.exports = function(callback) {  
  
  var ev = new Backbone.Model()
  var recipes

  // Get Recipe docs
  ev.on('0', function() {
    configDb.view('api', 'recipes', {include_docs:true}, function(err, res) {
      var recipes = res
      ev.trigger('1')
    })
  })

  // Evaluate all recipes
  ev.on('1', function() {
    var i = 0
    // Count the recipes as they are done
    var onRecipeDone = function() {
      i++
      if(i == recipes.length-1) {
        // All triggers have been evaluated
        ev.trigger('2')
      }
    }
    _.each(recipes, function(recipe) {
      evaluateRecipe(recipe, onRecipeDone)
    })
  })

  ev.on('2', function() {
    callback()
  })

  ev.trigger('0')

})