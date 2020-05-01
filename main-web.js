const express = require('express');
const childProcess = require('child_process');
const app = express();
const port = 5001;

// Setting up the public directory
app.use(express.static(__dirname+"/build/index.html"));

app.listen(port, () => console.log(`listening on port ${port}!`));

function runScript(scriptPath, callback) {

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
// Now we can run a script and invoke a callback when complete, e.g.
runScript('./app.js', function (err) {
    if (err) throw err;
    console.log('finished running some-script.js');
});