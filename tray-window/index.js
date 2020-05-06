const {ipcRenderer, shell} = require('electron')

let previousData = {}
let isWorking = false;
let lastCommand = undefined;


/*
All on click events handled here
 */
class_cmds = [
    ['js-start-action','start-blt'],['js-sync-action','sync-blt'],['js-restart-action','restart-blt'],
    ['js-kill-action','kill-blt'],['js-build-action','build-blt'],['js-sync-action','sync-blt'],
    ['js-enable-action','enable-blt'],['js-disable-action','disable-blt'],
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
    document.querySelector('.js-summary').textContent = 'STATUS: '+status
}

const getHealthData = () => {
    return getData('check-health');
}

const getSFMData = () => {
    return getData('is-need-sfm');
}

// use this for blt commands that require status change
const runCommand = (cmd) =>{
    isWorking = true;
    // setStatus('LOADING...')
    const status = cmd.replace("-blt",'')+"ing...";
    setStatus(status)
    stopUpdateFunc()
    ipcRenderer.send('app-update', {
        'icon': 'working', 'tool-tip': status
    });
    return defaultNodeCmd(cmd)
}

//basic get api command
const defaultNodeCmd = (cmd) =>{
    lastCommand = cmd
    return new Promise(resolve => {
        ipcRenderer.invoke('api', cmd).then(value => {
            isWorking=false
            updateFunc()
            resolve(value)
        })
    });
}

// use this for background tasks like checking for status
const getData = (cmd) =>{
    // if(isWorking)
    //     return undefined
    isWorking = true;
    // setStatus('LOADING...')
    stopUpdateFunc()
    // ipcRenderer.send('app-update', {
    //     'icon': 'working'
    // });
    return defaultNodeCmd(cmd)
}

const updateView = (data) => {
    // const currently = weather.currently
    let status = 'STOPPED'
    // document.querySelector('.js-start-action').disabled='enabled'
    // document.querySelector('.js-stop-action').disabled='disabled'
    if(data['app']['ui_check'] === 'UP') {
        status = "RUNNING"
        // document.querySelector('.js-start-action').disabled='disabled'
        // document.querySelector('.js-stop-action').disabled='enabled'
    }

    document.querySelector('.js-summary').textContent = 'STATUS: '+status
    // document.querySelector('.js-update-time').textContent = `at ${new Date(currently.time).toLocaleTimeString()}`
    //
    document.querySelector('.js-health-check-port').textContent = data['app']['port_check']
    document.querySelector('.js-health-check-ui').textContent = data['app']['ui_check']

}
let isGettingHealthData = false, isGettingSFMData = false;
const updateData = () =>{
    if(!isGettingHealthData) {
        isGettingHealthData = true;
        getHealthData().then(value => {
            value = JSON.parse(value['res']);
            // console.log(value);
            updateView(value);
            if(!isWorking)
                ipcRenderer.send('app-update', {
                    'icon': value['app']['ui_check'] === 'UP' ? 'running' : 'stopped'
                });
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
            if (value['sfm-needed'] === 'true')
                ipcRenderer.send('sfm-needed', value['sfm-needed']);
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