var moment = require('moment')
var _ = require('underscore')
var Backbone = require('backbone')
var HiveBackbone = require('../HiveBackbone/HiveBackbone')

module.exports = Backbone.Model.extend({
  epsilon: 60*60, 
  // Maximum number of times the dataset will be reduced, each time doubling the rdpEpsilonBase 
  factorLimit: 4,
  // We start at one
  factor: 1,
  process: function() {
    // RDP function from https://gist.github.com/rhyolight/2846020
    function findPerpendicularDistance(point, line) {
      var pointX = point[0],
        pointY = point[1],
        lineStart = {
          x: line[0][0],
          y: line[0][1]
        },
        lineEnd = {
          x: line[1][0],
          y: line[1][1]
        },
        slope = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x),
        intercept = lineStart.y - (slope * lineStart.x),
        result;
      result = Math.abs(slope * pointX - pointY + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
      return result;
    }
    function douglasPeucker(points, epsilon) {
      var i,
        maxIndex = 0,
        maxDistance = 0,
        perpendicularDistance,
        leftRecursiveResults, rightRecursiveResults,
        filteredPoints;
      // find the point with the maximum distance
      for (i = 2; i < points.length - 1; i++) {
        perpendicularDistance = findPerpendicularDistance(points[i], [points[1], points[points.length - 1]]);
        if (perpendicularDistance > maxDistance) {
          maxIndex = i;
          maxDistance = perpendicularDistance;
        }
      }
      // if max distance is greater than epsilon, recursively simplify
      if (maxDistance >= epsilon) {
        leftRecursiveResults = douglasPeucker(points.slice(1, maxIndex), epsilon);
        rightRecursiveResults = douglasPeucker(points.slice(maxIndex), epsilon);
        filteredPoints = leftRecursiveResults.concat(rightRecursiveResults);
      } else {
        filteredPoints = points;
      }
      return filteredPoints;
    }
    // Go
    this.points = douglasPeucker(this.points, this.epsilon)
})
