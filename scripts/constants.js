const {resolveHome} = require('./cmd')
const path = require('path')


module.exports = Object.freeze({
    logdir: resolveHome(path.join("~","logs")),
    basedir: 'data',
    cmddir: path.join(basedir,"cmd"),
    cmdlogdir: path.join(cmddir,"logs")
    
})

// exports.dbdir = path.join(basedir,'db')
exports.cmddir = path.join(basedir,)
exports.piddir = path.join(basedir,'pids')
exports.
exports.logdir = logdir

exports.logfile = path.join(logdir,"blt-buddy.log")