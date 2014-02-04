var expect = require('chai').expect
var tellCouchDbAboutDrives = require('../lib/TellCouchDbAboutDrives')

describe("TellCouchDbAboutDrives", function() {
  describe("#go()", function() {
    this.timeout(15000)
    it("should return an updated couch doc with info about disks", function(done) {
      tellCouchDbAboutDrives(function(err, newDoc) {
        expect(err).to.equal(null)
        expect(newDoc).to.be.an('object')
        done()
      })
    })
  })
})
