const express = require('express');
const childProcess = require('child_process');
const app = express();
const port = 5001;
const cmd = require('./cmd');

// Setting up the public directory
app.use(express.static(__dirname+"/build"));

app.listen(port, () => console.log(`listening on port ${port}!`));

// Now we can run a script and invoke a callback when complete, e.g.
cmd.runScript('./app.js', function (err) {
    if (err) throw err;
    console.log('finished running some-script.js');
});