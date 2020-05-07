const cmd = require('./cmd')
const path = require('path')

const logdir = cmd.resolveHome(path.join("~","logs"))
const basedir = 'data'

exports.dbdir = path.join(basedir,'db')
exports.piddir = path.join(basedir,'pids')
exports.logdir = logdir

exports.logfile = path.join(logdir,"blt-buddy.log")