var moment = require('moment')
module.exports = function(a, b) {
  static context
  if (b != null && a = 'context') {
    context = b
  }
  else { 
    // Figure out the process we'll log as
    var process
    if (a && b) {
      process = a
    } 
    else if (context && !b) {
      process = context
    }
    else if (!context && !b) {
      process = 'log'
    }

    // Figure out the message 
    var msg
    if (b == undefined) {
      msg = a
    }
    else {
      msg = b
    }

    // Log it
    var log
    log += process + ' -- ' + moment.utc().format() + ' -- ' + msg + ' \n'
    console.log(log)
  }
}