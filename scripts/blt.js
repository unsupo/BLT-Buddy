// import {md5} from "./cmd";

const path = require('path');
const fixPath = require('fix-path')
const {runPython, command, resolveHome, cmd} = require("./cmd");
const fs = require('fs')
const {md5} = require("./cmd");

fixPath();

const blt_dir = resolveHome(path.join("~","blt"))
const blt_app_dir = path.join(blt_dir,"app")
const blt = path.join('/usr', 'local', 'bin', 'blt')
const proj = '--project '

let working_dir; // = path.join(blt_app_dir, "main");
let projectDir
let project;

let working_dir_cmd; // = `cd ${working_dir} && `; // might not be needed because of project flag

// TODO sync and others that have user prompt
const replace_project = "[project]", working_dir_replace = '[working_dir]'
// TODO add p4 and ciab commands and interface as well as if you have a linux box
// TODO ciab needs creation commands (with various configs like branch and modules
// TODO ciab needs setup for nomachine and ssh setup for blt --build pre
// TODO add smart bear review process and blt submit as well as setting appropriate changelist with description
// TODO ability to open files in https://codesearch.data.sfdc.net/
const commands = {
    db_stop: `${blt} ${replace_project} --db-stop`,
    db_start: `${blt} ${replace_project} --db-start`,
    sdb_go: `${blt} ${replace_project} --sdb-go`,
    sync_blt: `${blt} ${replace_project} --sync`,
    build_blt: `${blt} ${replace_project} --build`,
    build_pre_blt: `${blt} ${replace_project} --build pre`,
    ide_blt: `${blt} ${replace_project} --ide`,
    enable_blt: `${blt} ${replace_project} --enable`,
    disable_blt: `${blt} ${replace_project} --enable`,
    start_blt: `${blt} ${replace_project} --start-bg`,
    stop_blt: `timeout 30 ${blt} ${replace_project} --stop || ps -ef|grep bl[t] |awk '{print $2}'|xargs kill -9`,
    enable_force: `${blt} ${replace_project} --enable force`,
    adventure_build: `cd ${working_dir_replace} && yes '' | Adventure build`,
    get_project_dirs: `cd ${blt_dir} &&  find app ! -path . ! -path app -name 'enabled.blt' -maxdepth 3 | xargs -I{} dirname {} | sort`,
    get_project_dir_status: `dir=${working_dir_replace}; [[ -f $dir/enabled.blt &&  $(egrep '^enabled\\s+=\\s+true' $dir/enabled.blt) ]] && printf 0 || printf 1`,
    restart_blt: `timeout 30 ${blt} ${replace_project} || ps -ef|grep bl[t] |awk '{print $2}'|xargs kill -9
${blt} ${replace_project} --db-stop
${blt} ${replace_project} --db-start
${blt} ${replace_project} --start-bg
`,
}
const cmd_replacer = (cmd_key) => cmd_key.replace(replace_project,project).replace(working_dir_replace,working_dir)
// use this for long running commands where you don't necessarily care about the output
const run_cmd = (cmd_key) => command(cmd_replacer(cmd_key))
// use this for quick commands where output is critical
const _cmd = (cmd_key) => cmd(cmd_replacer(cmd_key))

exports.getCmdKey = (hash) => {
    const c = Object.entries(commands);
    for(let i = 0; i<c.length; i++)
        if(md5(cmd_replacer(c[i][1]))===hash)
            return c[i][0];
    return null;
}
exports.getAvgTime = (cmd_key) => {
    return new Promise(resolve => {
        const hash = md5(cmd_replacer(cmd_key));
        const s = "s: ";
        let sum = 0, start = 0;
        fs.readFileSync(constants.timingslogdir+"/"+hash+".timings").split('\n').forEach(value => {
            if(value.startsWith(s))
                start = value.substr(s.length);
        })
    });
}

exports.getCommand = (cmd_key) => cmd_replacer(cmd_key)
exports.db_stop = () => run_cmd(commands.db_stop)
exports.db_start = () => run_cmd(commands.db_start)
exports.sdb_go = () => run_cmd(commands.sdb_go)
exports.restartBlt = () => run_cmd(commands.restart_blt)
exports.sync_blt = () => run_cmd(commands.sync_blt)
exports.build_blt = () => run_cmd(commands.build_blt)
exports.build_pre_blt = () => run_cmd(commands.build_pre_blt)
exports.ide_blt = () => run_cmd(commands.ide_blt)
exports.enable_blt = () => run_cmd(commands.enable_blt)
exports.disable_blt = () => run_cmd(commands.disable_blt)
exports.start_blt = () => run_cmd(commands.start_blt)
exports.stop_blt = () => run_cmd(commands.stop_blt)
exports.adventure_build = () => run_cmd(commands.adventure_build)
exports.enable_force = () => run_cmd(commands.enable_force)
// fast running commands use _cmd
exports.get_project_dirs = () => _cmd(commands.get_project_dirs)
exports.get_project_dir_status = () => _cmd(commands.get_project_dir_status)
exports.get_project = () => new Promise(resolve => resolve(projectDir))

exports.set_project = (dir) => new Promise(resolve => {
    working_dir = resolveHome(path.join("~", "blt", dir));
    projectDir = dir
    project = proj+projectDir
    working_dir_cmd = "cd " + working_dir + " && ";
    fs.writeFileSync(constants.projectFile,dir)
    resolve(working_dir)
})

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
exports.check_nexus_connection = () => run_python('--check_nexus_connection') //
