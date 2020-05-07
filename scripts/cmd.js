const path = require('path');
const childProcess = require('child_process');
const fixPath = require('fix-path')
const fs = require('fs');

fixPath();

const _command = (cmd) =>{
    return new Promise(resolve => {
        exec(cmd,(err,stdout,stderr)=>{
            resolve({'err':err,'stdout':stdout,'stderr':stderr})
        })
    })
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

exports.command = async (cmd) => {
    return _command(cmd)
}

exports.resolveHome = (filepath) => {
    if (filepath[0] === '~')
        return path.join(process.env.HOME, filepath.slice(1));
    return filepath;
}


exports.mkdir = (dir) =>{
    return _command('mkdir -p '+dir)
}