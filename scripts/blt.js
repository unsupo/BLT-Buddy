
const path = require('path');
const fixPath = require('fix-path')
const {logfile} = require("./constants");
const {runPython, command, cmd_detached, resolveHome} = require("./cmd");

fixPath();

let working_dir = resolveHome(path.join("~", "blt", "app", "main"));

const proj = ' --project '
let projectDir = "/app/main"
let project = proj+projectDir

const blt = path.join('/usr', 'local', 'bin', 'blt')
let working_dir_cmd = "cd " + working_dir + " && ";
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

exports.db_stop = () =>{
    return cmd.command(blt+project+" --db-stop")
}
exports.db_start = () =>{
    return cmd.command(blt+project+" --db-stop")
}

exports.restartBlt = () => {
    return new Promise(resolve =>
        sfm().then(() => killblt().then(res3 => {
            cmd.command(blt+project+" --db-stop").then(res2 => {
                cmd.command(blt+project+" --db-start").then(res1 => {
                    resolve(start_blt())
                })
            })
        }))
    );
}
exports.checkHealth = () =>{
    return new Promise(resolve =>
        runPython(['--health_check'],(err, ress) => {
            resolve({'err': err ? err : '', 'res': (ress?ress:'').toString()})
        })
    )
}

exports.isNeedSFM = () => {
    return new Promise(resolve =>
        runPython(['--check_sfm'],(err, ress) =>
            resolve({'err': err ? err : '', 'res': (ress?ress:'').toString()})
        )
    );
}

exports.kill = (name) => {
    return new Promise(resolve =>
        command("ps -ef|grep "+name+"|awk '{print $2}'|xargs kill -9").then(value => resolve(value))
    )
}
exports.killblt = (timeout) => {
    if(timeout === undefined)
        timeout = 20
    return new Promise(resolve =>
        command("timeout "+timeout+" blt "+project+" --stop || ps -ef|grep bl[t] |awk '{print $2}'|xargs kill -9")
            .then(value => resolve(value))
    )
}
exports.sfm = () => {
    return new Promise(resolve =>
        command(working_dir_cmd + " blt --sfm").then(value => resolve(value))
    )
}
exports.sync_blt = () => {
    return new Promise(resolve =>
        command(working_dir_cmd+blt+" --sync").then(value => resolve(value))
    )
}
exports.build_blt = () => {
    return new Promise(resolve =>
        // command(blt+project+" --build").then(value =>resolve(value))
        command("sleep 1; exit 1").then(value =>resolve(value))
    )
}
exports.enable_blt = () => {
    return new Promise(resolve =>
        command(blt+project+" --enable").then(value => resolve(value))
    )
}
exports.disable_blt = () => {
    return new Promise(resolve =>
        command(blt+project+" --disable").then(value => resolve(value))
    )
}
exports.set_project = (dir) => {
    working_dir = resolveHome(path.join("~", "blt", dir));
    projectDir = dir
    project = proj+projectDir
    working_dir_cmd = "cd " + working_dir + " && ";
}
exports.start_blt = () => {
    return new Promise(resolve => {
        const child = cmd_detached(working_dir, blt, ["--start-bg"]);
        child.on('error', (err) => console.log(err))
        resolve({'pid': child.pid})
    })
}