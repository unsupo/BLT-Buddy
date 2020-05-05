const util = require('util');
const express = require("express");
const cors = require('cors');
const {exec} = require('child_process')
const bodyParser = require('body-parser');
// const python = require('node-python');
const {PythonShell} = require('python-shell');

const python_options = {
    pythonPath: '/Users/jarndt/.local/share/virtualenvs/scripts-9RpDXMAm/bin/python3.7'
}
const exe = util.promisify(exec);

const working_dir = "~/blt/app/main";
const working_dir_cmd = "cd "+working_dir+" && ";

const func_killer = "\n" +
    "function killer(){\n" +
    "    ps -ef|grep $1|awk '{print $2}'|xargs kill -9\n" +
    "}"


async function command(cmd) {
    try {
        const {stdout, stderr} = await exe(cmd);
        return {'stdout': stdout, 'stderr': stderr};
    } catch (err) {
        return {'err': err};
    }
}
function cmd_detached(cwd,cmd,argv0) {
    const fs = require('fs');
    const out = fs.openSync('./out.log', 'a');
    const err = fs.openSync('./out.log', 'a');

    const cp = require('child_process');
    const child = cp.spawn(cmd,argv0, {cwd: cwd, detached: true, stdio: ['ignore', out, err]});
    child.unref();
    return child
}

const app = express();

app.use(bodyParser.json({
    extended: true
}));
app.use(cors()) // Use this after the variable declaration

const port = 5000;
app.listen(port, () => {
    console.log("Server running on port " + port);
});
// use this for direct communication between app server and electron.. hence app through emitters (ipcMain)
process.on("message",(cmd)=>{
   command(cmd['cmd']).then(res => process.send(res))
});

app.post("/cmd", (req, res) => {
    const value = req.body.value;
    command(value).then(result => res.json(result));
});

app.post("/start-blt", (req, res) => {
    // command(working_dir_cmd+"(blt --start-bg)").then(result => res.json(result));
    const child = cmd_detached(working_dir,"blt", ["--start-bg"]);
    res.json({'pid': child.pid})
});
app.post("/stop-blt", (req, res) => {
    command(working_dir_cmd+ "blt --stop").then(result => res.json(result));
});
app.post("/kill-blt", (req, res) => {
    command(func_killer+"\n"+working_dir_cmd+ "(timeout 20 blt --stop || killer bl[t])").then(result => res.json(result));
});
app.get("/check-health",(req, res)=>{
    let options = {
        args: ['--health_check']
    }
    options = Object.assign({},options,python_options);
    PythonShell.run('./scripts/blt.py',options,(err,ress)=>{
        if(err === undefined)
            err = '';
        if(ress === undefined)
            ress = '';

        res.json({'err':err,'res':ress.toString()})
    });
    // command("python ./scripts/blt.py").then(result => res.json(result));
   //  const python = require('child_process').spawn('python', ["./scripts/blt.py"]);
   //  python.stdout.on('data',(data)=>{
   //    res.json(data.toString());
   // });
   //  python.stderr.on('data',(data)=>{
   //     res.json(data.toString());
   //  });
});
