module.exports = {
  domain: "hive.local",
  path: "/root/GroundHive",
  Queen: {
  	URL: "http://127.0.0.1:125"
  },
  Honeycomb: {
    URL: "http://127.0.0.1:126"
  },
  Beekeeper: {
    path: "/root/GroundHive/Beekeeper"
  },
  CouchDB: {
    URL: "http://127.0.0.1:5984",
  },
  'processRecipesFrequencyInMinutes': 5,
  'harvestHoneyJarsFrequencyInMinutes': 5,
  'tellCouchDbAboutDrivesFrequencyInMinutes': 5
}
