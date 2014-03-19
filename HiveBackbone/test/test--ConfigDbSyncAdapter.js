var _ = require('underscore')
var Backbone = require('backbone')
var Settings = require('../../Settings')
var nano = require('nano')(Settings.CouchDB.URL)
var HiveBackbone = require('../../HiveBackbone/HiveBackbone.js')
var expect = require('chai').expect

describe("ConfigDbSyncAdapter", function() {
  it("Checking save and fetch", function(done) {

    var ModelClass = Backbone.Model.extend({
      idAttribute: "_id",
      initialize: function() {
        this.sync = new require('../lib/ConfigDbSyncAdapter')
      }
    })

    var model = new ModelClass({'kind':'Test', 'foo':'bar'})
    var sameModel

    var start = function() {
      model.once('sync', fetchModelInstance)
      model.save()
    }

    var fetchModelInstance = function() {
      var id = model.id
      sameModel = new ModelClass({'_id':id})
      sameModel.once('sync', checkModelInstance)
      sameModel.fetch()
    }

    var checkModelInstance = function() {
      expect(sameModel.get('kind')).to.be.equal('Test')
      sameModel.once('destroy', function() {
        done() 
      })
      sameModel.destroy()
    }

    start()

  })
})
