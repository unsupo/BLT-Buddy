'use strict';
const {resolveHome} = require('./cmd')
const path = require('path')

const _logdir = resolveHome(path.join("~","logs"))
exports.logdir = _logdir
const basedir = path.join(__dirname,'data')
const cmddir = path.join(basedir,"cmd")
exports.cmdlogdir = path.join(cmddir,"logs")
exports.piddir = path.join(cmddir,'pids')
exports.scriptsdir = path.join(cmddir,'scripts')
exports.logfile = path.join(_logdir,"blt-buddy.log")

// exports.constants = Object.freeze({
//     logdir: logdir,
//     basedir: basedir,
//     cmddir: cmddir,
//     cmdlogdir: cmdlogdir,
//     piddir: piddir,
//     scriptsdir: scriptsdir,
//     logfile: logfile,
// })
