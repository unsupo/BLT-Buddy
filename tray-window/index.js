const {ipcRenderer, shell} = require('electron')

let previousData = {}
let isWorking = false;
let lastCommand = undefined;
let isError = false;
let status = 'STOPPED'

/*
All on click events handled here
 */
class_cmds = [
    ['js-start-action','start-blt'],['js-sync-action','sync-blt'],['js-restart-action','restart-blt'],
    ['js-kill-action','kill-blt'],['js-build-action','build-blt'],['js-sync-action','sync-blt'],
    ['js-enable-action','enable-blt'],['js-disable-action','disable-blt'],['quit','quit']
]
document.addEventListener('click', (event) => {
    if (event.target.href) {
        // open window links
        const window_ref = 'window:'
        if(event.target.href.startsWith(window_ref)){
            const w = event.target.href.slice(window_ref.length)
            ipcRenderer.send('open-window', {
                'window': w
            });
        }else {
            // Open links in external browser
            shell.openExternal(event.target.href).then(r => undefined);
            event.preventDefault()
        }
    } else if (!isWorking && event.target.classList.contains('js-refresh-action')) {
        updateData()
    }
    class_cmds.forEach(e => event.target.classList.contains(e[0]) ? runCommand(e[1]) : undefined)
})

const setStatus = (status) => {
    document.querySelector('.js-summary').textContent = status
}

const getHealthData = () => {
    return getData({cmd:'check-health'});
}

const getSFMData = () => {
    return getData({cmd:'is-need-sfm'});
}

/*
pass in one class or an array of classes
pass in a state either true or false otherwise it will use the opposite of current state
 */
const disableEnableButtons = (buttonClasses,isDisabled) =>{
    if(typeof buttonClasses === 'string')
        buttonClasses = [buttonClasses];
    buttonClasses.forEach(buttonClass=>
        document.getElementsByClassName(buttonClass)[0].disabled =
            isDisabled?isDisabled:!document.getElementsByClassName(buttonClass)[0].disabled)
}

// use this for blt commands that require status change
const runCommand = (cmd) =>{
    isWorking = true;
    // setStatus('LOADING...')
    disableEnableButtons(['js-start-action','js-sync-action','js-build-action'],true)
    const status = (cmd.replace("-blt",'')+"ing...").toUpperCase();
    setStatus(status)
    stopUpdateFunc()
    ipcRenderer.send('app-update', {
        'icon': 'working', 'tool-tip': status
    });
    return runApiCommand({cmd:cmd})
}

const runApiCommand = (cmd) =>{
    lastCommand = cmd
    return new Promise(resolve => {
        ipcRenderer.invoke('api', cmd).then(value => {
            if(cmd['cmd'] === 'is-need-sfm')
                return;
            if(value["err"]){
                isError = true
                setStatus(value["err"]);
                ipcRenderer.send('app-update', {
                    'icon': 'error', 'tool-tip': value['stderr'], 'error': value['stderr']
                });
            }
            if(cmd['cmd'] !== 'check-health') { // check-health shouldn't change the working status or buttons
                isWorking = false // main returned a result so we aren't working anymore
                disableEnableButtons(['js-start-action', 'js-sync-action', 'js-build-action'], false) //re-enable buttons
            }else if(!isWorking) { // if it's not working and it's a health check then change status
                const s = JSON.parse(value['res'])['app']['ui_check'] === 'UP' ? 'running' : 'stopped'
                setStatus(s);
                ipcRenderer.send('app-update', {
                    'icon':s, 'tool-tip':s
                });
            } else{
                ipcRenderer.send('app-update', {
                    'icon': 'working', 'tool-tip': status
                });
                setStatus("SUCCESS");
            }
            updateFunc()
            resolve(value)
        })
    });
}

//basic get api command
// const defaultNodeCmd = (cmd) =>{
//     lastCommand = cmd
//     return new Promise(resolve => {
//         ipcRenderer.invoke('api', cmd).then(value => {
//             isWorking=false
//             if(value['err']) {
//                 isError = true
//                 ipcRenderer.send('app-update', {
//                     'icon': 'error', 'tool-tip': value['err']
//                 });
//             }
//             updateFunc()
//             resolve(value)
//         })
//     });
// }

// use this for background tasks like checking for status
const getData = (cmd) =>{
    // if(isWorking)
    //     return undefined
    // isWorking = true;
    // setStatus('LOADING...')
    stopUpdateFunc()
    // ipcRenderer.send('app-update', {
    //     'icon': 'working'
    // });
    return runApiCommand(cmd)
}

const updateView = (data) => {
    // const currently = weather.currently
    // let status = 'STOPPED'
    let openLink = document.getElementsByClassName('open-webpage')[0];

    // document.querySelector('.js-start-action').disabled='enabled'
    // document.querySelector('.js-stop-action').disabled='disabled'
    if(data['app']['ui_check'] === 'UP') {
        status = "RUNNING"
        openLink.style.visibility = "visible";
        // document.querySelector('.js-start-action').disabled='disabled'
        // document.querySelector('.js-stop-action').disabled='enabled'
    }else
        openLink.style.visibility = "hidden";

    document.querySelector('.js-summary').textContent = status
    // document.querySelector('.js-update-time').textContent = `at ${new Date(currently.time).toLocaleTimeString()}`
    //
    if(document.querySelector('.js-health-check-port')) {
        document.querySelector('.js-health-check-port').textContent = data['app']['port_check']
        document.querySelector('.js-health-check-ui').textContent = data['app']['ui_check']
    }

}
let isGettingHealthData = false, isGettingSFMData = false;
let createdNotificationTime = Date.now()-1000;
const updateData = () =>{
    if(!isGettingHealthData) {
        isGettingHealthData = true;
        getHealthData().then(value => {
            value = JSON.parse(value['res']);
            // console.log(value);
            updateView(value);
            if(!isWorking) {
                const s = value['app']['ui_check'] === 'UP' ? 'running' : 'stopped'
                ipcRenderer.send('app-update', {
                    'icon':s, 'tool-tip':s
                });
            }
            previousData['health'] = value;
            isGettingHealthData = false;
        })
    }
    if(!isGettingSFMData) {
        isGettingSFMData = true;
        getSFMData().then(value => {
            value = JSON.parse(value['res']);
            // console.log(value);
            // updateView(value);
            // don't spam notifications only do it every 10 minutes while sfm is needed
            if (value && ((new Date) - createdNotificationTime > tenMinutes))
                ipcRenderer.invoke('sfm-needed', value).then(value1 => createdNotificationTime=Date.now())
            previousData['sfm'] = value;
            isGettingSFMData = false;
        })
    }
};

const oneSecond = 1000;
const oneMinute = 60 * oneSecond;
const tenMinutes = oneMinute*10;

let updateVar;
updateFunc();

function updateFunc() {
    updateVar = setInterval(updateData, oneSecond*10);
}
function stopUpdateFunc(){
    clearInterval(updateVar);
}

// Update initial weather when loaded
document.addEventListener('DOMContentLoaded', updateData)



/*
// for post
const defaultPost = (path)=>{
    lastCommand = path
    postData(path).then((data)=>{
        updateFunc()
    }).catch((err)=>{
        console.log(err)
        isWorking=false
        updateFunc()
    });
}

const postData = (path, data, headers) =>{
    isWorking = true;
    setStatus('LOADING...')
    stopUpdateFunc()
    ipcRenderer.send('app-update', {
        'icon': 'working'
    });
    return fetch('http://localhost'+":"+5000+'/'+path,{
        method: 'POST',
        headers: headers,
        body: data ? JSON.stringify(data) : data
    }).then((resp)=>{
        return resp.json()
    });
}
        // this causes too many requests
        // ipcRenderer.on('api-reply',(event, args) =>{
        //     isWorking=false
        //     updateFunc()
        //     resolve(args)
        // })

    // return new Promise(resolve => {
    //     ipcRenderer.invoke('api', cmd).then(value => {
    //         isWorking = false
    //         updateFunc()
    //         // console.log(args)
    //         resolve(args)
    //     })
    // })
    // return window.fetch('http://localhost:5000/'+path).then((response) => {
    //     return response.json()
    // })
 */