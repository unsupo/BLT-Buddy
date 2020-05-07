const cmd = require('./cmd')
const path = require('path')

const logdir = cmd.resolveHome(path.join("~","logs"))

exports.piddir = 'pids'
exports.logdir = logdir

exports.logfile = path.join(logdir,"blt-buddy.log")