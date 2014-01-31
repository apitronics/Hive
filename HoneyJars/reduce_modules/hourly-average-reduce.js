var moment = require('moment')
var _ = require('underscore')
var Backbone = require('backbone')
var HiveBackbone = require('../../HiveBackbone/HiveBackbone')

module.exports = Backbone.Model.extend({
  process: function(points, blockSize) {
   
    //  
    // Break up points into blocks
    // 

    var blocks = {}
    var map = []

    // Collect block entries where the key is the hour and the value is an array of integers
    points.forEach(function(point) {
      var hourBlock = moment(point[0], 'X').format('YYYY-MM-DD HH')
      if(!_.has(blocks, hourBlock)) {
        blocks[hourBlock] = []
      }
      blocks[hourBlock].push(point[1])
    })

    // Find the average in each block's array
    _.each(blocks, function(value, key, list) {
      var sum = 0
      blocks[key].forEach(function(value) {
        sum += value
      })
      blocks[key] = parseInt(sum/blocks[key].length)
    })

    // Transform into something CouchDB can handle
    _.each(blocks, function(value, key, list) {
      map.push({_id: key, value: value})
    })

    return map
  }
})
