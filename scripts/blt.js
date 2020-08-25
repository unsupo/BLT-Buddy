const util = require('util');
const cp = require('child_process')
const { exec } = require('child_process')
const {PythonShell} = require('python-shell');
const path = require('path');
const cmd = require('./cmd')
const fixPath = require('fix-path')

fixPath();

const working_dir = cmd.resolveHome(path.join("~", "blt", "app", "main"));

const blt = path.join('/usr', 'local', 'bin', 'blt')
const working_dir_cmd = "cd " + working_dir + " && ";
const func_killer = "\n" +
    "function killer(){\n" +
    "    ps -ef|grep $1|awk '{print $2}'|xargs kill -9\n" +
    "}"



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
    // const fs = require('fs');
    // const out = fs.openSync('./out.log', 'a');
    // const err = fs.openSync('./out.log', 'a');

    const child = cp.spawn(cmd, argv0, {cwd: cwd, detached: true, stdio: ['ignore', 'ignore', 'ignore']});
    child.unref();
    return child
}
exports.cmd_detached = (cwd, cmd, argv0) => {
    return _cmd_detached(cwd,cmd,argv0)
}

exports.restartBlt = () => {
    return new Promise(resolve =>
        sfm().then(() => killblt().then(res3 => {
            _command(working_dir_cmd + blt+" --db-stop").then(res2 => {
                _command(working_dir_cmd + blt+" --db-start").then(res1 => {
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
exports.killblt = () => {
    return new Promise(resolve =>
        _command(func_killer + "\n" + working_dir_cmd + "(timeout 20 blt --stop || killer bl[t])")
            .then(value => resolve(value))
    )
}
exports.sfm = () => {
    return new Promise(resolve =>
        _command(working_dir_cmd + "blt --sfm").then(value => resolve(value))
    )
}
exports.sync_blt = () => {
    return new Promise(resolve =>
        _command(working_dir_cmd + "blt --butts").then(value => resolve(value))
    )
}
exports.build_blt = () => {
    return new Promise(resolve =>
        _command(working_dir_cmd + "blt --build").then(value => resolve(value))
    )
}
exports.enable_blt = () => {
    return new Promise(resolve =>
        _command(working_dir_cmd + "blt --enable").then(value => resolve(value))
    )
}
exports.disable_blt = () => {
    return new Promise(resolve =>
        _command(working_dir_cmd + "blt --disable").then(value => resolve(value))
    )
}
exports.dummy = () => {
    return new Promise(resolve =>
        _command("blt --butts").then(value =>resolve(value))
    )
}
exports.start_blt = () => {
    return new Promise(resolve => {
        const child = _cmd_detached(working_dir, path.join("/usr", "local", "bin", "blt"), ["--start-bg"]);
        child.on('error', (err) => console.log(err))
        resolve({'pid': child.pid})
    })
}