const path = require('path');
const childProcess = require('child_process');
const fixPath = require('fix-path')
const cp = require('child_process')
const { exec } = require('child_process')
const { PythonShell } = require('python-shell');
const crypto = require('crypto')
const fs = require('fs');

fixPath();

const md5 = (str) => crypto.createHash('md5').update(str).digest('hex')

const python_options = {
    pythonPath: path.join(__dirname, '.venv', 'bin', 'python3.7')
}

const _runPython = (args, callback) =>{
    let options = {
        args: args
    }
    options = Object.assign({}, options, python_options);
    PythonShell.run(path.join(__dirname,'blt.py'), options, callback);
}

const _command = (cmd) =>{
    return new Promise(resolve => {
        exec(cmd,(err,stdout,stderr)=>{
            resolve({'err':err,'stdout':stdout,'stderr':stderr})
        })
    })
}

const isPidStillRunning = (pid) => {
    return new Promise(resolve => _command("ps -a "+pid+"; echo $?")
        .then(value => resolve(value['stdout'] === '0')))
}

const waitForPid = (pid, exitfile) => {
    // return _command("wait "+pid)
    return new Promise(resolve =>
        _command("lsof -p "+pid+" +r 1 &>/dev/null").then(value =>
            resolve(fs.readFileSync(exitfile))
        )
    );
}
// returns the detached pid of the command after executing it
const _run_cmd = (cmd) => {
    // hash is the key to the cmd so we can check if the cmd is currently running and get the pid
    return new Promise(resolve => {

        function detached(cwd,scr,args,o,e) {
            const c = _cmd_detached(cwd,scr,args,o,e)
            const p = c.pid
            const exitfile = path.join(constants.cmdexitdir,hash+".exit")
            fs.writeFileSync(pid,p)
            c.on('exit',(code, signal) => fs.writeFileSync(exitfile,code))
            return [p,exitfile]
        }

        const hash = md5(cmd)
        const log =  path.join(constants.cmdlogdir, hash + ".log")
        const out = fs.openSync(log,'a')
        const err = fs.openSync(log,'a')
        const pid = path.join(constants.piddir, hash + ".pid")
        const script = path.join(constants.scriptsdir, hash + ".sh")
        const c = '#!/usr/bin/env bash\n${cmd}'
        if(!fs.existsSync(script)) // if file doesn't exist
            fs.writeFileSync(script,c,{mode: 0o755}) //c+"runCMD 2>&1 "+log+" & echo $! > "+pid
        if(!fs.existsSync(pid)) // if pid file doesn't exist
            return resolve(detached(constants.scriptsdir, script, undefined, out, err))
        isPidStillRunning(fs.readFileSync(pid)).then(value => {
            if(value) // return pid if it's still running
                return resolve(pid) // pid still running
            return resolve(detached(constants.scriptsdir, script, undefined, out, err))
        })
    })
}

const _cmd_detached = (cwd, cmd, argv0, out, err) => {
    // const fs = require('fs');
    // const log = path.join(logdir,'blt-buddy-out.log');
    // const out = fs.openSync(log, 'a');
    // const err = fs.openSync(log, 'a');

    const child = cp.spawn(cmd, argv0, {cwd: cwd, detached: true, stdio: ['ignore', out ? out : 'ignore', err ? err : 'ignore']});
    child.unref();
    return child
}

exports.runScript = (scriptPath, callback) => {

    // keep track of whether callback has been invoked to prevent multiple invocations
    let invoked = false;

    const process = childProcess.fork(scriptPath);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        const err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });
}

exports.cmd_detached = (cwd,cmd,argv0) =>{
    return _cmd_detached(cwd,cmd,argv0)
}

exports.command = async (cmd) => {
    // return _command(cmd)
    return _run_cmd(cmd).then(value => waitForPid(value[0],value[1]))
}

exports.resolveHome = (filepath) => {
    if (filepath[0] === '~')
        return path.join(process.env.HOME, filepath.slice(1));
    return filepath;
}

exports.runPython = (args, callback) =>{
    _runPython(args,callback)
}