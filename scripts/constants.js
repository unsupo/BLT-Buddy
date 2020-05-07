const {resolveHome} = require('./cmd')
const path = require('path')

const logdir = resolveHome(path.join("~","logs"))
const basedir = 'data'
const cmddir = path.join(basedir,"cmd")
const cmdlogdir = path.join(cmddir,"logs")
const piddir = path.join(cmddir,'pids')
const scriptsdir = path.join(cmddir,'scripts')
const logfile = path.join(logdir,"blt-buddy.log")

module.exports = Object.freeze({
    
})
