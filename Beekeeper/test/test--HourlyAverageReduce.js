var expect = require('chai').expect
var hourlyAverageReduce = require('../lib/HourlyAverageReduce.js')

describe("HourlyAverageReduce", function() {
  it("should return an array of hourly averages keyed by the hour", function(done) {

    var input = [
      // 1983-12-06 02
      ["439524000", 0.1],
      ["439524020", 0.2],
      ["439524030", 0.3],
      // 1983-12-06 03
      ["439530600", 0.4],
      ["439530620", 0.5],
      ["439530630", 0.6],
      // 1983-12-06 04
      ["439534200", 0.7],
      ["439534220", 0.8],
      ["439534230", 0.9]
    ]

    var output = hourlyAverageReduce(input)
    expect(output).to.be.an('array')
    expect(output).to.be.eql([
      {"_id":"1983-12-06 02","value":"0.20"},
      {"_id":"1983-12-06 03","value":"0.50"},
      {"_id":"1983-12-06 04","value":"0.80"}
    ])
    done()

  })
})
