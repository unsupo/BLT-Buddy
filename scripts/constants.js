'use strict';

const {resolveHome} = require('./cmd')
const path = require('path')

const logdir = resolveHome(path.join("~","logs"))
const bltdir = resolveHome(path.join("~","blt-test"))
const bltdocsdir = resolveHome(path.join(bltdir,"blt-code","plugins","blt","doc"))
const basedir = path.join(process.cwd(),'data')
const cmddir = path.join(basedir,"cmd")
const cmdlogdir = path.join(cmddir,"logs")
const cmdexitdir = path.join(cmddir,"exit")
const piddir = path.join(cmddir,'pids')
const scriptsdir = path.join(cmddir,'scripts')
const logfile = path.join(logdir,"blt-buddy.log")
const projectFile = path.join(basedir,'project-path.txt')
const docdir = path.join(process.cwd(),'src','docs')
const uidata = path.join(basedir,'ui-data.json')

global.constants = Object.freeze({
    logdir: logdir,
    basedir: basedir,
    cmddir: cmddir,
    cmdlogdir: cmdlogdir,
    piddir: piddir,
    scriptsdir: scriptsdir,
    logfile: logfile,
    cmdexitdir: cmdexitdir,
    projectFile: projectFile,
    bltdocsdir: bltdocsdir,
    docdir: docdir,
    uidata: uidata,
    bltdir: bltdir
})
