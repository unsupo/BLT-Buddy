'use strict';

const {resolveHome} = require('./cmd')
const path = require('path')

const logdir = resolveHome(path.join("~","logs"))
const cmddir = path.join(basedir,"cmd")
const cmdlogdir = path.join(cmddir,"logs")
const piddir = path.join(cmddir,'pids')
const scriptsdir = path.join(cmddir,'scripts')
const logfile = path.join(logdir,"blt-buddy.log")

global.constants = Object.freeze({
    logdir: logdir,
    basedir: basedir,
    cmddir: cmddir,
    cmdlogdir: cmdlogdir,
    piddir: piddir,
    scriptsdir: scriptsdir,
    logfile: logfile,
})
