var _ = require('underscore')
var Backbone = require('backbone')
var Settings = require('../../Settings')
var nano = require('nano')(Settings.CouchDB.URL)
var HiveBackbone = require('../../HiveBackbone/HiveBackbone.js')
var expect = require('chai').expect

describe("HiveBackboneModelsRecipe", function() {
  it("Recipe.setState should result in a change of state property with timestamp", function(done) {
    var recipe = new HiveBackbone.Models.Recipe()
    recipe.setState('test')
    expect(recipe.get('state')).to.be.an('array')
    expect(recipe.get('state')[1]).to.be.equal('test')
    done()
  })
})
