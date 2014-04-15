module.exports = {
  domain: "hive.local",
  path: "/root/Hive",
  Queen: {
  	URL: "http://127.0.0.1:125"
  },
  Honeycomb: {
    URL: "http://127.0.0.1:126"
  },
  Beekeeper: {
    path: "/root/Hive/Beekeeper"
  },
  CouchDB: {
    URL: "http://127.0.0.1:5984",
  },
  'harvestHoneyJarsFrequencyInMinutes': 5,
  'tellCouchDbAboutDrivesFrequencyInMinutes': 5
}
