const {resolveHome} = require('./cmd')
const path = require('path')


module.exports = Object.freeze({
    logdir: resolveHome(path.join("~","logs")),
    basedir: 'data',
    cmddir: path.join(this.basedir,"cmd"),
    cmdlogdir: path.join(this.cmddir,"logs"),
    piddir: path.join(this.cmddir,'pids'),
    scriptsdir: path.join(this.cmddir,'scripts'),
    logfile: path.join(this.logdir,"blt-buddy.log")
})
