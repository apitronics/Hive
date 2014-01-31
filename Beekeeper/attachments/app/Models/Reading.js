$(function() {

  App.Models.Reading = Backbone.Model.extend({

    idAttribute: "_id",

    url: function() {
      var url = (_.has(this, 'id'))
        ? '/readings/' + this.id + '?rev=' + this.get('_rev')
        : '/readings'
      return url
    },

    parse: function(doc) {
      this.set('value', doc.d)
      this.set('d', doc.d)
      //var hexTime = doc._id.substr(32,doc._id.length)
      //this.set('timestamp', parseInt(hexTime, 16))
      this.set('timestamp', doc._id)
      this.id = doc._id
    }

  })

})
