const {ipcRenderer, shell} = require('electron')

let previousData = {}
let isWorking = false;
let lastCommand = undefined;
let isError = false;
let STATUS = 'STOPPED'
const CANT_CONNECT = 'CAN"T CONNECT', SFM_NEEDED = 'SFM NEEDED', DOWN = 'STOPPED', RUNNING = 'RUNNING',
    WORKING='working', DEFAULT='default';

/*
All on click events handled here
If it starts with js- and ends with -action it is a button
 */
class_cmds = [
    ['js-start-action','start-blt'],['js-sync-action','sync-blt'],['js-restart-action','restart-blt'],
    ['js-kill-action','kill-blt',{'timeout':0}],['js-build-action','build-blt'],['js-sync-action','sync-blt'],
    ['js-enable-action','enable-blt'],['js-disable-action','disable-blt'],['quit','quit'],
    ['js-change-status-action']
] // TODO should say stopping not killing
// TODO stopping app still shows is running will it's trying to stop it
document.addEventListener('click', (event) => {
    if (event.target.href) {
        // open window links
        const window_ref = 'window:'
        if(event.target.href.startsWith(window_ref)){
            const w = event.target.href.slice(window_ref.length)
            ipcRenderer.send('open-window', {'window': w});
        }else {
            // Open links in external browser
            shell.openExternal(event.target.href).then(r => undefined);
            event.preventDefault()
        }
    } else if (!isWorking && event.target.classList.contains('js-refresh-action'))
        updateData()
    class_cmds.forEach(e => event.target.classList.contains(e[0]) ? runCommand(e[1],e.length > 1 ? e[2] : undefined) : undefined)
})

const setStatus = (status,icon) => {
    STATUS = status;
    if(icon)
        ipcRenderer.send('app-update', {
            'icon':icon, 'tool-tip':status
        });
    document.querySelector('.js-summary').textContent = status
}

const getHealthData = () => {
    return getData({cmd:'check-health'});
}

// use runBasicApiCommand for these because they don't update UI
const getSFMData = () => {
    return runBasicApiCommand({cmd:'is-need-sfm'});
}
const getStatus = () => {
    return runBasicApiCommand({cmd:'get_project_dir_status'});
}

/*
pass in one class or an array of classes
pass in a state either true or false otherwise it will use the opposite of current state
 */
const disableEnableButtons = (buttonClasses,isDisabled) =>{
    if(typeof buttonClasses === 'string')
        buttonClasses = [buttonClasses];
    buttonClasses.forEach(buttonClass=>{
        try {
            document.getElementsByClassName(buttonClass)[0].disabled =
                isDisabled !== undefined ? isDisabled : !document.getElementsByClassName(buttonClass)[0].disabled
        }catch (e) { /*DO NOTHING, this is caused when class doesn't exist */ }
    })
}

const disableEnableAllButtons = (isDisabled) => {
    class_cmds.filter(a=>a[0].toString().startsWith('js-') && a[0].toString().endsWith('-action'))
        .forEach(buttonArr=>disableEnableButtons(buttonArr[0],true));
}

// use this for blt commands that require status change
const runCommand = (cmd, args) =>{
    isWorking = true;
    disableEnableButtons(['js-start-action','js-sync-action','js-build-action'],true)
    const status = (cmd.replace("-blt",'')+"ing...").toUpperCase();
    setStatus(status,WORKING)
    stopUpdateFunc()
    // ipcRenderer.send('app-update', {
    //     'icon': 'working', 'tool-tip': status
    // });
    return runApiCommand({cmd:cmd,args: args})
}
const runBasicApiCommand = (cmd) => ipcRenderer.invoke('api', cmd)

const runApiCommand = (cmd) =>{
    lastCommand = cmd
    return new Promise(resolve => {
        runBasicApiCommand(cmd).then(value => {
            if(value["err"]){
                isError = true
                setStatus(value["err"]);
                ipcRenderer.send('app-update', {
                    'icon': 'error', 'tool-tip': 'ERROR', 'error': value['stderr'],
                    'notification': {
                        'title': "BLT Buddy",'body': `ERROR Occurred with ${cmd['cmd']}`,
                        'onclick': {'key': 'open-file', 'value': value['err']}
                    }
                });
                setStatus("ERROR");
            }
            if(cmd['cmd'] !== 'check-health') { // check-health shouldn't change the working status or buttons
                isWorking = false // main returned a result so we aren't working anymore
                disableEnableButtons(['js-start-action', 'js-sync-action', 'js-build-action'], false) //re-enable buttons
                setStatus("SUCCESS",DEFAULT);
            }else if(!isWorking && STATUS!==SFM_NEEDED && STATUS!==CANT_CONNECT) { // if it's not (working on something and status is not SFM or CN"T CNT) and it's (a health check) then change status
                const s = JSON.parse(value['res'])['app']['ui_check'] === 'UP' ? RUNNING : DOWN
                setStatus(s,s.toLowerCase());
            }
            updateFunc()
            resolve(value)
        })
    });
}


// use this for background tasks like checking for status
const getData = (cmd) =>{
    stopUpdateFunc()
    return runApiCommand(cmd)
}

const updateView = (data) => {
    let openLink = document.getElementsByClassName('open-webpage')[0];

    if(data['app']['ui_check'] === 'UP') {
        openLink.style.visibility = "visible";
        setStatus(RUNNING, RUNNING.toLowerCase());
    }else // this means it's either down or working
        openLink.style.visibility = "hidden";

    if(document.querySelector('.js-health-check-port')) {
        document.querySelector('.js-health-check-port').textContent = data['app']['port_check']
        document.querySelector('.js-health-check-ui').textContent = data['app']['ui_check']
    }

}

let isGettingHealthData = false, isGettingSFMData = false, isGettingNexusConnectionData;
let createdNotificationTime = Date.now()-1000;
const updateData = () =>{
    if(!isGettingHealthData && STATUS !== CANT_CONNECT) {
        isGettingHealthData = true;
        getHealthData().then(value => {
            try {
                let res = JSON.parse(value['res']);
                updateView(res);
                if(!isWorking) {
                    const s = res['app']['ui_check'] === 'UP' ? RUNNING : DOWN
                    ipcRenderer.send('app-update', {
                        'icon':s.toLowerCase(), 'tool-tip':s
                    });
                }
            }catch (e) {
                console.error(e)
            }
            previousData['health'] = value;
            isGettingHealthData = false;
        })
    }
    if(!isGettingSFMData && STATUS !== CANT_CONNECT) {
        isGettingSFMData = true;
        getSFMData().then(value => {
            try {
                let res = JSON.parse(value['res']);
                if(res) {
                    disableEnableAllButtons(true);
                    setStatus(SFM_NEEDED,DEFAULT)
                }else if (STATUS === SFM_NEEDED){
                    disableEnableButtons(false);
                    setStatus(DOWN,DEFAULT);
                }
            }catch (e) {
                console.error(e)
            }
            // don't spam notifications only do it every 10 minutes while sfm is needed
            // if (value && ((new Date) - createdNotificationTime > tenMinutes))
            //     ipcRenderer.invoke('sfm-needed', value).then(value1 => createdNotificationTime=Date.now())
            previousData['sfm'] = value;
            isGettingSFMData = false;
        })
    }

    if(!isGettingNexusConnectionData){
        isGettingNexusConnectionData = true;
        runBasicApiCommand({cmd:'check_nexus_connection'}).then(value => {
            try {
                let res = JSON.parse(value['res']);
                if(!res) {
                    disableEnableAllButtons(true);
                    setStatus(CANT_CONNECT,DEFAULT)
                }else if (STATUS === CANT_CONNECT){
                    disableEnableButtons(false);
                    setStatus(DOWN,DEFAULT);
                }
            }catch (e) {
                console.error(e)
            }
            isGettingNexusConnectionData = false;
        });
    }
};

const setEnableDisableStatus = () => getStatus().then(value => {
    value = value['stdout']
    const b = document.querySelector('.js-change-status-action')
    function changeEDStatus(status) {
        status = status.toLowerCase();
        b.textContent = status.charAt(0).toUpperCase() + status.slice(1)
        // remove the enable action and add the disable action
        b.classList.remove(`js-${status === 'enable' ? 'disable': 'enable'}-action`)
        const c = status === 'enable' ? 'positive' : 'negative'
        b.classList.remove('btn-'+c)
        b.classList.add('btn-'+c)
        b.classList.add(`js-${status}-action`)
    }
    if(value === "0")  //then project is enabled so allow button to disable project
        changeEDStatus('disable')
    else
        changeEDStatus('enable')
})

let projectPaths = [];
const setProjectsPaths = () => {
    const select = document.querySelector('.projects')
    select.addEventListener('change',evt => {
        const picked = projectPaths[parseInt(evt.target['value'])]
        runBasicApiCommand({'cmd':'set-project','args':{'dir':picked}}).then(value =>
            setEnableDisableStatus().then(value1 => console.log(value))
        )
    })
    return runBasicApiCommand({cmd:'get_project_dirs'}).then(value => {
        value = value['stdout']
        let i = 0
        runBasicApiCommand({'cmd':'get_project'}).then(project => {
            value.split('\n').forEach(value1 => {
                const node = document.createElement('option')
                const textnode = document.createTextNode(value1);
                node.setAttribute('value', '' + i++)
                if (value1 === project)
                    node.setAttribute('selected', 'selected')
                node.appendChild(textnode);
                select.appendChild(node)
                projectPaths.push(value1)
            })
        })
    })
}

const oneSecond = 1000;
const oneMinute = 60 * oneSecond;
const tenMinutes = oneMinute*10;

let updateVar;

function updateFunc() {
    updateVar = setInterval(updateData, oneSecond*10);
}
function stopUpdateFunc(){
    clearInterval(updateVar);
}
// TODO set interval seperately for health check and sfm and other recurring api calls
// TODO add password prompt, save it in config.blt as p4.password
function onDOMLoaded() {
    // do this once and then again whenever project changes
    setEnableDisableStatus()
    setProjectsPaths()
    updateData()
    updateFunc();
}

// Update initial weather when loaded
document.addEventListener('DOMContentLoaded', onDOMLoaded)
