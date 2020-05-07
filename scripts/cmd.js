const path = require('path');
const childProcess = require('child_process');
const fixPath = require('fix-path')
const fs = require('fs');

fixPath();
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


exports.resolveHome = (filepath) => {
    if (filepath[0] === '~') {
        return path.join(process.env.HOME, filepath.slice(1));
    }
    return filepath;
}


exports.mkdir = (dir) =>{
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir)
}