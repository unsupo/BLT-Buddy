'use strict';

const {app,BrowserWindow, Tray, nativeImage, Notification} = require('electron');
const path = require('path');
const jetpack = require('fs-jetpack');

app.allowRendererProcessReuse = true;

const childProcess = require('child_process');

function runScript(scriptPath, callback) {

    // keep track of whether callback has been invoked to prevent multiple invocations
    let invoked = false;

    const process = childProcess.fork(scriptPath);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        const err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });

}

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.loadFile( __dirname+"/build/index.html");
}


function notify() {
    let myNotification = new Notification('Title', {
        body: 'Lorem Ipsum Dolor Sit Amet'
    })

    myNotification.onclick = () => {
        console.log('Notification clicked')
    }
    myNotification.show();
}

const createTray = ()=> {
    const iconName = '1-block-blue.png';
    const iconPath = path.join(__dirname,iconName);
    console.log(jetpack.exists(iconPath)); //should be "file", otherwise you are not pointing to your icon file
    let nimage = nativeImage.createFromPath(iconPath);
    nimage = nimage.resize({'width': 16, 'height': 16})
    const tray = new Tray(nimage);

    // const tray = new Tray(path.join( __dirname,"build","favicon.ico"));
    tray.on('click',(event => notify()))
}

app.whenReady().then(createWindow).then(createTray).then(()=>{
    // Now we can run a script and invoke a callback when complete, e.g.
    runScript('./app.js', function (err) {
        if (err) throw err;
        console.log('finished running some-script.js');
    });
}).catch(reason => console.log(reason));

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})