var moment = require('moment')
module.exports = function(process, msg) {
  var log = ''
  if (msg == undefined) {
    msg = process
    log += 'log -- ' + moment.utc().format() + ' -- ' + msg + ' \n'
  }
  else {
    log += process + ' -- ' + moment.utc().format() + ' -- ' + msg + ' \n'
  }
  console.log(log)
}
