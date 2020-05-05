const {ipcRenderer, shell} = require('electron')

let previousData = undefined
let isWorking = false;

document.addEventListener('click', (event) => {
    if (event.target.href) {
        // Open links in external browser
        shell.openExternal(event.target.href).then(r => undefined);
        event.preventDefault()
    } else if (!isWorking && event.target.classList.contains('js-refresh-action')) {
        updateData()
    } else if (event.target.classList.contains('js-quit-action')) {
        // window.close()
    } else if (event.target.classList.contains('js-start-action')) {
        defaultPost('start-blt')
    } else if (event.target.classList.contains('js-sync-action')) {
        defaultPost('sync-blt')
    } else if (event.target.classList.contains('js-stop-action')) {
        defaultPost('stop-blt')
    } else if (event.target.classList.contains('js-kill-action')) {
        defaultPost('kill-blt')
    } else if (event.target.classList.contains('open-webpage')) {
        // window.open('http://localhost:6109');
        ipcRenderer.send('open-webpage', {
            'link': 'http://localhost:6109'
        });
    } else if (event.target.classList.contains('advanced-features')) {
        ipcRenderer.send('open-window', {
            'window': 'main'
        });
    }
})

const defaultPost = (path)=>{
    postData(path).then((data)=>{
        updateFunc()
    }).catch((err)=>{
        console.log(err)
        isWorking=false
        updateFunc()
    });
}

const getHealthData = () => {
    return getData('check-health');
}

const postData = (path, data, headers) =>{
    isWorking = true;
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

const getData = (path) =>{
    return window.fetch('http://localhost:5000/'+path).then((response) => {
        return response.json()
    })
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
`# example
{
  "err": null,
  "res": [
    "{'app': {'port_check': 'UP', 'ui_check': 'UP'}}"
  ]
}`
const updateData = () =>{
    getHealthData().then(value => {
        value = JSON.parse(value['res']);
        // console.log(value);
        updateView(value);
        ipcRenderer.send('app-update', {
            'icon': value['app']['ui_check']  === 'UP' ? 'running' : 'stopped'
        });
        previousData = value;
    })
};

// Refresh weather every 10 minutes
const oneSecond = 1000;
const oneMinute = 60 * oneSecond;
const tenMinutes = oneMinute*10;

let updateVar;
updateFunc();

function updateFunc() {
    updateVar = setInterval(updateData, oneSecond);
}
function stopUpdateFunc(){
    clearInterval(updateVar);
}

// Update initial weather when loaded
document.addEventListener('DOMContentLoaded', updateData)
