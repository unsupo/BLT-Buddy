const {resolveHome} = require('./cmd')
const path = require('path')


module.exports = Object.freeze({
    logdir: resolveHome(path.join("~","logs")),
    basedir: 'data',
    cmddir: path.join(basedir,"cmd"),
    cmdlogdir: path.join(cmddir,"logs"),
    piddir: path.join(cmddir,'pids'),
    scriptsdir: path.join(cmddir,'scripts'),
    logfile: path.join(logdir,"blt-buddy.log")
})
