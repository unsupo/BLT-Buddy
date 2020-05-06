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
    ['js-enable-action','enable-blt'],['js-disable-action','disable-blt'], ['build-blt','build-blt'], ['dummy','dummy'], ['quit', 'quit'],
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
    document.querySelector('.js-summary').textContent = status;
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
    document.getElementsByClassName('js-start-action')[0].disabled = true;
    document.getElementsByClassName('js-sync-action')[0].disabled = true;
    document.getElementsByClassName('js-build-action')[0].disabled = true;
    // setStatus('LOADING...')
    const status = cmd.replace("-blt",'').toUpperCase()+"ING...";
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
            if(cmd == 'is-need-sfm'){
                return;
            }
            isWorking=false
            document.getElementsByClassName('js-start-action')[0].disabled = false;
            document.getElementsByClassName('js-sync-action')[0].disabled = false;
            document.getElementsByClassName('js-build-action')[0].disabled = false;
            if(value["err"]){
                ipcRenderer.send('app-update', {
                    'icon': 'error', 'tool-tip': status
                    });
                setStatus(value["err"]);
            }
            if(cmd != 'start-blt' && !value["err"]){
                ipcRenderer.send('app-update', {
                    'icon': 'idle', 'tool-tip': status
                    });
                setStatus("SUCCESS");
            }
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

let status = 'STOPPED'


const updateView = (data) => {
    // const currently = weather.currently
    // document.querySelector('.js-start-action').disabled='enabled'
    // document.querySelector('.js-stop-action').disabled='disabled'
    console.log(data);
    if(data['app'] != null && data['app']['ui_check'] === 'UP') {
        status = "RUNNING"
        // document.querySelector('.js-start-action').disabled='disabled'
        // document.querySelector('.js-stop-action').disabled='enabled'
    }

    document.querySelector('.js-summary').textContent = status
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
            if(value['res'] != null){
                value = JSON.parse(value['res']);
            }
            console.log(value);
            updateView(value);
            if(!isWorking)
                ipcRenderer.send('app-update', {
                    'icon': value['app'] != null && value['app']['ui_check'] === 'UP' ? 'running' : 'stopped'
                });
            previousData['health'] = value;
            isGettingHealthData = false;
        })
    }
    if(!isGettingSFMData) {
        isGettingSFMData = true;
        getSFMData().then(value => {
            if(value['res'] != null){
                value = JSON.parse(value['res']);
            }
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