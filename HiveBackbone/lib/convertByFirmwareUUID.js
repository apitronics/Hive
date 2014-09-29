var _ = require('underscore');

module.exports = function(collection) {

  collection = _.object(_.map(collection.models, function(model) {
    var uuid = parseInt(model.get('firmwareUUID'), 16),
        name = model.get('name');

    return [uuid, model];
  }));

  return collection;
};
