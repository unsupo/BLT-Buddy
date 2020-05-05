'use strict';

const {ipcRenderer, ipcMain, app, BrowserWindow, Tray, nativeImage, Notification} = require('electron');
const path = require('path');
const jetpack = require('fs-jetpack');
const {fork} = require('child_process')
const assetsDirectory = path.join(__dirname, 'assets', 'icons', 'png')

app.allowRendererProcessReuse = true;
let tray = undefined;
let tray_window = undefined;
let win = undefined;
let script = undefined;

app.whenReady().then(createWindow).then(createTray).then(createTrayWindow).then(() => {
    // Now we can run a script and invoke a callback when complete, e.g.
    // run the server
    // script = cmd.runScript('./app.js',  (err) => {
    //     if (err) throw err;
    //     console.log('finished running some-script.js');
    // });
    script = fork('./app.js')
    script.on('message',args => args)
    script.send({'cmd': 'ls'})
}).catch(reason => console.log(reason));

const getMainWindow = () =>{
    if(win)
        return win
    return createWindow()
}

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 900,
        height: 700,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            // Prevents renderer process code from not running when window is
            // hidden
            backgroundThrottling: false
        },
        icon: path.join(assetsDirectory, 'app64.png')
    })
    win.loadFile(__dirname + "/build/index.html");

    win.on('closed',()=>{
        // console.log('closing')
        win = undefined;
    })
    return win
}

function createTrayWindow() {
    tray_window = new BrowserWindow({
        width: 220,
        height: 320,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            // Prevents renderer process code from not running when window is
            // hidden
            backgroundThrottling: false
        }
    })
    tray_window.loadFile(__dirname + "/tray-window/index.html");

    // Hide the window when it loses focus
    tray_window.on('blur', () => {
        if (!tray_window.webContents.isDevToolsOpened()) {
            tray_window.hide()
        }
    })
}

const sendNotification = (title,body,onclick) => {
    let notification = new Notification(title, {
        body: body
    })

    // Show window when notification is clicked
    notification.onclick = onclick;
}

function createTray() {
    const iconName = 'tray-icon-stopped.png';
    const iconPath = path.join(assetsDirectory, iconName);
    console.log(jetpack.exists(iconPath)); //should be "file", otherwise you are not pointing to your icon file
    let nimage = nativeImage.createFromPath(iconPath);
    nimage = nimage.resize({'width': 16, 'height': 16})
    console.log(nimage)
    tray = new Tray(nimage);
    // tray.on('click',(event => notify()))

    tray.on('right-click', toggleWindow)
    tray.on('double-click', toggleWindow)
    tray.on('click', (event => toggleWindow()))
}

const toggleWindow = () => {
    if (tray_window.isVisible()) {
        tray_window.hide()
    } else {
        showTrayWindow()
    }
}
const showMainWindow = () =>{
    getMainWindow().show();
    getMainWindow().focus();
}
const showTrayWindow = () => {
    const position = getWindowPosition()
    tray_window.setPosition(position.x, position.y, false)
    tray_window.show()
    tray_window.focus()
}
const getWindowPosition = () => {
    const windowBounds = tray_window.getBounds()
    const trayBounds = tray.getBounds()

    // Center window horizontally below the tray icon
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

    // Position window 4 pixels vertically below the tray icon
    const y = Math.round(trayBounds.y + trayBounds.height + 4)

    return {x: x, y: y}
}


ipcMain.on('show-window', () => {
    showTrayWindow()
})
ipcMain.on('open-window',(event, data) => {
    switch(data['window']){
        case 'tray': showTrayWindow(); break
        case 'main': showMainWindow(); break
    }
});

let icon_last;
ipcMain.on('open-webpage',(event, data) => {
    require("electron").shell.openExternal(data["link"]).then(value => console.log('webpage opened'))
});

ipcMain.on('app-update', (event, appStatus) => {
    let iconv;
    switch (appStatus['icon']) {
        case 'running':
            iconv = 'tray-icon-running.png';
            break
        case 'working':
            iconv = 'tray-icon-working.png';
            break
        case 'error':
            iconv = 'tray-icon.png';
            break
        case 'stopped':
        default:
            iconv = 'tray-icon-stopped.png';
    }
    // console.log(iconv+","+appStatus['icon'])
    if (icon_last && icon_last === iconv)
        return;
    sendNotification('BLT Status Update',appStatus['icon'],() => {
        ipcRenderer.send('open-window',{'window': 'tray'}) // show window if notifaction is clicked
    })
    const iconPath = path.join(assetsDirectory, iconv);
    // console.log(jetpack.exists(iconPath)); //should be "file", otherwise you are not pointing to your icon file
    let nimage = nativeImage.createFromPath(iconPath);
    nimage = nimage.resize({'width': 16, 'height': 16})
    tray.setImage(nimage);
    tray.setToolTip(appStatus['icon']);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    console.log('quiting')
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('quit',()=>{
    console.log('quiting')
    // process.kill(fork.pid,'SIGTERM')
    script.kill('SIGINT'); // need to kill forked subprocess, node express webserver
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})