const path = require('path');
const fixPath = require('fix-path')
const {logfile} = require("./constants");
const {runPython, command, resolveHome} = require("./cmd");

fixPath();

const blt_dir = resolveHome(path.join("~","blt"))
const blt_app_dir = path.join(blt_dir,"app")
let working_dir = path.join(blt_app_dir, "main");

const proj = ' --project '
let projectDir = "/app/main"
let project = proj+projectDir

const blt = path.join('/usr', 'local', 'bin', 'blt')
let working_dir_cmd = `cd ${working_dir} && `; // might not be neede because of project flag

// TODO sync and others that have user prompt
const replace_project = "[project]"

const commands = {
    db_stop: `${blt} ${replace_project} --db-stop`,
    db_start: `${blt} ${replace_project} --db-start`,
    sync_blt: `${blt} ${replace_project} --sync`,
    enable_blt: `${blt} ${replace_project} --enable`,
    disable_blt: `${blt} ${replace_project} --enable`,
    start_blt: `${blt} ${replace_project} --start-bg`,
    get_project_dirs: `find ${blt_app_dir} -type d -maxdepth 1`,
    get_project_dir_status: `[${working_dir}]`,
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
exports.get_project_dirs = () => run_cmd(commands.get_project_dirs)
exports.get_project_dir_status = () => run_cmd(commands.get_project_dir_status)

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
const run_python = (arg) => new Promise(resolve =>
        runPython([arg], (err, ress) => {
            resolve({'err': (err ? err : '').toString(), 'res': (ress ? ress : '').toString()})
        })
    )

exports.checkHealth = () => run_python('--health_check') // needed for beautiful soup
exports.isNeedSFM = () => run_python('--check_sfm') // needed for pexpect
