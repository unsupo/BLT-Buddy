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
const replace_project = "[project]"

const commands = {
    db_stop: `${blt} ${replace_project} --db-stop`,
    db_start: `${blt} ${replace_project} --db-start`,
    sync_blt: `${blt} ${replace_project} --sync`,
    enable_blt: `${blt} ${replace_project} --enable`,
    disable_blt: `${blt} ${replace_project} --enable`,
    start_blt: `${blt} ${replace_project} --start-bg`,
    restart_blt: `timeout 10 ${blt} ${replace_project} || ps -ef|grep bl[t] |awk '{print $2}'|xargs kill -9
${blt} ${replace_project} --db-stop
${blt} ${replace_project} --db-start
${blt} ${replace_project} --start-bg
`,
}
const cmd_replacer = (cmd_key) => cmd_key.replace(replace_project,project)
const run_cmd = (cmd_key) => cmd.command(cmd_replacer(cmd_key))


exports.getCommand = (cmd_key) => cmd_replacer(cmd_key)
exports.db_stop = () => run_cmd(commands.db_stop)
exports.db_start = () => run_cmd(commands.db_start)
exports.restartBlt = () => run_cmd(commands.restart_blt)
exports.sync_blt = () => run_cmd(commands.sync_blt)
exports.build_blt = () => run_cmd(commands.sync_blt)
exports.enable_blt = () => run_cmd(commands.enable_blt)
exports.disable_blt = () => run_cmd(commands.disable_blt)
exports.start_blt = () => run_cmd(commands.start_blt)

exports.set_project = (dir) => {
    working_dir = resolveHome(path.join("~", "blt", dir));
    projectDir = dir
    project = proj+projectDir
    working_dir_cmd = "cd " + working_dir + " && ";
}

exports.killblt = (timeout) => {
    if(timeout === undefined)
        timeout = 20
    return new Promise(resolve =>
        command("timeout "+timeout+" blt "+project+" --stop || ps -ef|grep bl[t] |awk '{print $2}'|xargs kill -9")
            .then(value => resolve(value))
    )
}

// Python script stuff
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
