const util = require('util');
const cp = require('child_process')
const { exec } = require('child_process')
const {PythonShell} = require('python-shell');
const path = require('path');
const cmd = require('./cmd')
const fixPath = require('fix-path')

fixPath();

let working_dir = cmd.resolveHome(path.join("~", "blt", "app", "main"));

const proj = ' --project '
let projectDir = "/app/main"
let project = proj+projectDir

const blt = path.join('/usr', 'local', 'bin', 'blt')
let working_dir_cmd = "cd " + working_dir + " && ";
const logfile = cmd.resolveHome(path.join("~","blt-buddy.log"))
const outToLog = " >> "+logfile;
const func_killer = "\n" +
    "function killer(){\n" +
    "    ps -ef|grep $1|awk '{print $2}'|xargs kill -9\n" +
    "}"

const process_checker = "function process_checker(){\n" +
    "    cmd=\"$1\"\n" +
    "    if ! ps aux | grep -v grep | grep \"${cmd}\" > /dev/null; then\n" +
    "        $(${cmd})\n" +
    "    fi\n" +
    "}\n" +
    "\n" +
    "process_checker "

// run command out to log file then save pid
// cmd > test.out & echo $! > test.pid

// TODO save or find pid and kill be able to kill it if requested
// TODO sync and others that have user prompt

const python_options = {
    pythonPath: path.join(__dirname, '.venv', 'bin', 'python3.7')
}
// const exe = util.promisify(exec);


const _runPython = (args, callback) =>{
    let options = {
        args: args
    }
    options = Object.assign({}, options, python_options);
    PythonShell.run(path.join(__dirname,'blt.py'), options, callback);
}

exports.runPython = (args, callback) =>{
    _runPython(args,callback)
}
const _command = async (cmd) => {
    return new Promise(resolve => {
        exec(cmd,(err,stdout,stderr)=>{
            resolve({'err':err,'stdout':stdout,'stderr':stderr})
        })
    })
}
exports.command = (cmd) => {
    return _command(cmd)
}

const _cmd_detached = (cwd, cmd, argv0) => {
    const fs = require('fs');
    const log = cmd.resolveHome(path.join("~",'blt-buddy-out.log'));
    const out = fs.openSync(log, 'a');
    const err = fs.openSync(log, 'a');

    const child = cp.spawn(cmd, argv0, {cwd: cwd, detached: true, stdio: ['ignore', out, err]});
    child.unref();
    return child
}
exports.cmd_detached = (cwd, cmd, argv0) => {
    return _cmd_detached(cwd,cmd,argv0)
}

exports.db_stop = () =>{
    return _command(blt+project+" --db-stop"+outToLog)
}
exports.db_start = () =>{
    return _command(blt+project+" --db-stop"+outToLog)
}

exports.restartBlt = () => {
    return new Promise(resolve =>
        sfm().then(() => killblt().then(res3 => {
            _command(blt+project+" --db-stop"+outToLog).then(res2 => {
                _command(blt+project+" --db-start"+outToLog).then(res1 => {
                    resolve(start_blt())
                })
            })
        }))
    );
}
exports.checkHealth = () =>{
    return new Promise(resolve =>
        _runPython(['--health_check'],(err, ress) => {
            resolve({'err': err ? err : '', 'res': (ress?ress:'').toString()})
        })
    )
}

exports.isNeedSFM = () => {
    return new Promise(resolve =>
        _runPython(['--check_sfm'],(err, ress) =>
            resolve({'err': err ? err : '', 'res': (ress?ress:'').toString()})
        )
    );
}

exports.kill = (name) => {
    return new Promise(resolve =>
        _command(func_killer + "\n" + "killer " + name).then(value => resolve(value))
    )
}
exports.killblt = (timeout) => {
    if(timeout === undefined)
        timeout = 20
    return new Promise(resolve =>
        _command(func_killer + "\n" + "(timeout "+timeout+" blt "+project+" --stop || killer bl[t])")
            .then(value => resolve(value))
    )
}
exports.sfm = () => {
    return new Promise(resolve =>
        _command(working_dir_cmd + " blt --sfm"+outToLog).then(value => resolve(value))
    )
}
exports.sync_blt = () => {
    return new Promise(resolve =>
        _command(working_dir_cmd+blt+" --sync"+outToLog).then(value => resolve(value))
    )
}
exports.build_blt = () => {
    return new Promise(resolve =>
        _command(blt+project+" --build"+outToLog).then(value =>resolve(value))
    )
}
exports.enable_blt = () => {
    return new Promise(resolve =>
        _command(blt+project+" --enable"+outToLog).then(value => resolve(value))
    )
}
exports.disable_blt = () => {
    return new Promise(resolve =>
        _command(blt+project+" --disable"+outToLog).then(value => resolve(value))
    )
}
exports.set_project = (dir) => {
    working_dir = cmd.resolveHome(path.join("~", "blt", dir));
    projectDir = dir
    project = proj+projectDir
    working_dir_cmd = "cd " + working_dir + " && ";
}
exports.start_blt = () => {
    return new Promise(resolve => {
        const child = _cmd_detached(working_dir, blt, ["--start-bg"]);
        child.on('error', (err) => console.log(err))
        resolve({'pid': child.pid})
    })
}

const check_if_process_running = (cmd) => {
    return _command("if ! ps aux | grep -v grep | grep \""+cmd+"\"; then echo yes; else echo no;")
}