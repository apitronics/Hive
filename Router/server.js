var Settings = require('../Settings'),
    log = require('../util/log.js'),
    express = require('express'),
    server = express(),
    cors = require('cors'),
    timeout = require('connect-timeout'),
    httpProxy = require('http-proxy');

/*
 * On port 8000 we wire everything together using httpProxy.
 */

var proxy = httpProxy.createServer({});

server.use('/queen', function(req, res){
  proxy.web(req, res, { target: 'http://127.0.0.1:125' });
});

server.use('/beekeeper', function(req, res){
  proxy.web(req, res, { target: 'http://127.0.0.1:8800' });
});

server.use('/honeycomb', function(req, res){
  proxy.web(req, res, { target: 'http://127.0.0.1:126' });
});

server.use('/update', function(req, res){
  proxy.web(req, res, { target: 'http://127.0.0.1:124' });
});

server.use(function(req, res){
  proxy.web(req, res, { target: Settings.CouchDB.URL });
});

server.use(cors());
server.use(timeout('30m')); // 30 min timeout

server.listen(8000);
log('Hive Router', 'httpProxy listening at port 8000');
