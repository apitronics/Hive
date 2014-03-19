var _ = require('underscore')
var Backbone = require('backbone')
var Settings = require('../../Settings')
var nano = require('nano')(Settings.CouchDB.URL)
var db = nano.use('config')

module.exports = function (method, model, options) {
  var data = model.toJSON()
  if (model.hasOwnProperty('id')) {
    data._id = model.id
  }
  if (data.hasOwnProperty('rev')) {
    data._rev = model.rev
    delete data.rev
  }
  switch (method) {
    case 'create':
      db.insert(model.toJSON(), function(err, body) {
        body._id = body.id
        delete body.id
        body._rev = body.rev
        delete body.rev
        model.set(body)
        model.id = body._id 
        model.trigger('sync')
       
      })
      break;
    case 'read':
      db.get(model.id, null, function(err, body) {
        model.set(body)
        model.trigger('sync')
      })
      break;
    case 'update':
      db.insert(model.toJSON(), function(err, body) {
        body._id = body.id
        delete body.id
        body._rev = body.rev
        delete body.rev
        model.set(body)
        model.trigger('sync')
      })
      break; 
    case 'delete':
      db.destroy(model.id, model.get('_rev'), function(err, body) {
        model.trigger('sync')
      })
      break;
  }
}
