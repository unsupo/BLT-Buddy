const {resolveHome} = require('./cmd')
const path = require('path')


module.exports = Object.freeze({
    logdir: resolveHome(path.join("~","logs")),
    basedir: 'data',
    cmddir: path.join(basedir,"cmd"),
    cmdlogdir: path.join(cmddir,"logs"),
    piddir: path.join(cmddir,'pids'),
    logfile: path.join(logdir,"blt-buddy.log")
})
