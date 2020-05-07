const {resolveHome} = require('./cmd')
const path = require('path')


class Constants {
    logdir = resolveHome(path.join("~","logs"))
    basedir = 'data'
    cmddir = path.join(this.basedir,"cmd")
    cmdlogdir = path.join(this.cmddir,"logs")

}

// exports.dbdir = path.join(basedir,'db')
exports.cmddir = path.join(basedir,)
exports.piddir = path.join(basedir,'pids')
exports.
exports.logdir = logdir

exports.logfile = path.join(logdir,"blt-buddy.log")