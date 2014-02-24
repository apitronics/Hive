var Settings = require('./Settings')
var http = require('http')
var log = require('./util/log.js')
var express = require('express')
var httpProxy = require('http-proxy')
couchDb = require('nano')(Settings.CouchDB.URL)
var configDb = couchDb.db.use('config')


/*
 * On port 8000 we wire everything together using httpProxy. 
 * Put the App at /app/ and redirect all other requests to CouchDB.
 */

var options = {
  router: {
    'hive.local/queen': '127.0.0.1:125',
    'hive.local/honeycomb': '127.0.0.1:126',
    'hive.local/beekeeper': '127.0.0.1:8800', 
    'hive.local/*': Settings.CouchDB.URL 
  }
}

httpProxy.createServer(options).listen(8000)
//httpProxy.createServer(options).listen(80)
log('Hive Router', 'httpProxy listening at port 80')
