const {resolveHome} = require('./cmd')
const path = require('path')

const logdir = resolveHome(path.join("~","logs"))
const basedir = path.join(__dirname,'data')
const cmddir = path.join(basedir,"cmd")
const cmdlogdir = path.join(cmddir,"logs")
const piddir = path.join(cmddir,'pids')
const scriptsdir = path.join(cmddir,'scripts')
const logfile = path.join(logdir,"blt-buddy.log")

exports.logdir = logdir
exports.basedir = basedir
exports.cmddir = cmddir
exports.cmdlogdir = cmdlogdir
exports.piddir = piddir
exports.scriptsdir = scriptsdir
exports.logfile = logfile
