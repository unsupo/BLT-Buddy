const path = require('path');
const childProcess = require('child_process');
const fixPath = require('fix-path')
const cp = require('child_process')
const { exec, spawn } = require('child_process')
const { PythonShell } = require('python-shell');
const crypto = require('crypto')
const fs = require('fs');

fixPath();

const md5 = (str) => crypto.createHash('md5').update(str).digest('hex')

exports.md5 = md5

const python_options = {
    pythonPath: path.join(__dirname, '.venv', 'bin', 'python')
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
const _command2 = (cmd) =>{
    return new Promise(resolve => {
        spawn(cmd,(err,stdout,stderr)=>{
            resolve({'err':err,'stdout':stdout,'stderr':stderr})
        })
    })
}

const isPidStillRunning = (pid) => {
    return new Promise(resolve => _command(`ps -a ${pid.toString()} > /dev/null; echo $?`)
        .then(value => resolve(value['stdout'].trim() === '0')))
}

exports.isPidStillRunning = isPidStillRunning;

const isCmdStillRunning = (cmd) => {
    return new Promise(resolve => _command(`ps -ef | grep "${cmd.toString()}" | grep -v grep | awk '{print $2}'`)
        .then(value => resolve(value['stdout'].trim().split('\n')[0])))
}

const waitForPid = (pid, exitfile, logfile, cmd, checked) => {
    return new Promise(resolve => {
        function pidWaiter() {
            isPidStillRunning(pid).then(value => {
                function returnFile(value) {
                    function getExitCode() {
                        const r = parseInt(fs.readFileSync(exitfile).toString())
                        if (r !== 0)
                            value['err'] = logfile
                        return value
                    }

                    // if exit code file doesn't exist wait using a file watcher on the directory
                    if (!fs.existsSync(exitfile))
                        fs.watch(constants.cmdexitdir).on("change", (eventType, filename) => {
                            if (filename === exitfile)
                                return getExitCode();
                        })
                    const timings = path.join(constants.timingslogdir, md5(cmd) + ".timings");
                    fs.appendFileSync(timings,"e: "+new Date().getTime()+"\n") // script is done write out time it ended
                    return getExitCode(); //else just return it
                }

                if (value) { // if it is still running then wait for it
                    return _command(`lsof -p ${pid} +r 1 &>/dev/null`).then(value1 =>
                        waitForPid(pid,exitfile,logfile).then(value2 =>  )
                    )
                } else // otherwise just return the exit code
                    return returnFile({'err': '', 'stdout': '', 'stderr': ''})
            })
        }
        if (cmd && checked)
            isCmdStillRunning(cmd).then(value => {
                if(value)
                    _command(`lsof -p ${value.toString()} +r 1 &>/dev/null`).then(value1 =>
                        resolve(waitForPid(pid,exitfile,logfile,cmd,true))
                    )
                else
                    resolve(pidWaiter());
            })
        else
            resolve(pidWaiter())
    });

}
// returns the detached pid of the command after executing it
const _run_cmd = (cmd) => {
    // hash is the key to the cmd so we can check if the cmd is currently running and get the pid
    return new Promise(resolve => {

        function detached(cwd,scr,args,o,e,l,cmd) {
            const c = _cmd_detached(cwd,scr,args,o,e)
            const p = c.pid
            const exitfile = path.join(constants.cmdexitdir,hash+".exit")
            fs.writeFileSync(pid,p)
            c.on('exit',(code, signal) => fs.writeFileSync(exitfile,code))
            return [p,exitfile,l,cmd]
        }

        const hash = md5(cmd)
        const timings = path.join(constants.timingslogdir, hash + ".timings");
        // this will save timings data, averaging the difference between start and end times gives a good predicted time
        // for this command.  Other factors will affect this as well, mostly workspace-users.xml, also unhandled user inputs
        if(fs.existsSync(timings)) //if timings file doesn't exist make it and add start time
            fs.appendFileSync(timings,"s: "+new Date().getTime()+"\n") // script starting write out time it started
        else // append start time to file
            fs.writeFileSync(timings,"s: "+new Date().getTime()+"\n")
        const log =  path.join(constants.cmdlogdir, hash + ".log")
        const out = fs.openSync(log,'a')
        const err = fs.openSync(log,'a')
        const pid = path.join(constants.piddir, hash + ".pid")
        const script = path.join(constants.scriptsdir, hash + ".sh")
        const c = `#!/usr/bin/env bash\n${cmd}`
        if(!fs.existsSync(script)) // if script file doesn't exist, make it (meaning this is the first time running this script)
            fs.writeFileSync(script,c,{mode: 0o755}) //c+"runCMD 2>&1 "+log+" & echo $! > "+pid
        if(!fs.existsSync(pid)) // if pid file doesn't exist then detach the process
            return resolve(detached(constants.scriptsdir, script, undefined, out, err, log,cmd))
        isPidStillRunning(fs.readFileSync(pid)).then(value => {
            if(value) // YES, return pid if it's still running
                return resolve(pid) // pid still running
            return resolve(detached(constants.scriptsdir, script, undefined, out, err,log,cmd))
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

exports.getPidForCommand = (cmd) => new Promise(resolve => resolve(fs.readFileSync(path.join(constants.piddir, md5(cmd) + ".pid"))))

exports.kill = (name) => command("ps -ef|grep "+name+"|awk '{print $2}'|xargs kill -9")
exports.killpid = (pid) => command(`kill -9 ${pid}`)

exports.killcmd = (cmd) => getPidForCommand(cmd).then(pid => killpid(pid))

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

exports.command = async (cmd) => _run_cmd(cmd).then(value => waitForPid(value[0],value[1],value[2],value[3],true))
exports.cmd = async (cmd) => _command(cmd)

exports.resolveHome = (filepath) => {
    if (filepath[0] === '~')
        return path.join(process.env.HOME, filepath.slice(1));
    return filepath;
}

exports.runPython = (args, callback) =>{
    _runPython(args,callback)
}