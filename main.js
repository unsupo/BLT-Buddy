'use strict';

const {ipcRenderer, ipcMain, app, BrowserWindow, Tray, nativeImage, Notification} = require('electron');
const path = require('path');
const jetpack = require('fs-jetpack');
const {fork} = require('child_process')
const blt = require('./scripts/blt')


const assetsDirectory = path.join(__dirname, 'assets', 'icons', 'png')

const appFolder = path.dirname(process.execPath)
const updateExe = path.resolve(appFolder, '..', 'Update.exe')
const exeName = path.basename(process.execPath)

const fixPath = require('fix-path')

app.setLoginItemSettings({
    openAtLogin: true,
    path: updateExe,
    args: [
        '--processStart', `"${exeName}"`,
        '--process-start-args', `"--hidden"`
    ]
})

app.allowRendererProcessReuse = true;

fixPath();

let tray = undefined;
let tray_window = undefined;
let win = undefined;
// let script = fork('./app.js')
// script.on('message',args => args)
// script.send({'cmd': 'ls'})

app.whenReady()
    .then(createWindow)
    .then(createTray)
    .then(createTrayWindow)


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
        icon: getIcon('apple-icon.png',{'width': 512, 'height': 512})
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
        width: 800,
        height: 600,
        show: false,
        frame: false,
        fullscreenable: false,
        // resizable: false,
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
    notification.show();
}

const getIcon = (relpath,size) =>{
    let nimage = nativeImage.createFromPath(path.join(assetsDirectory,relpath))
    nimage = nimage.resize(size)
    return nimage
}

function createTray() {
    // const iconName = 'tray-icon-stopped.png';
    // const iconPath = path.join(assetsDirectory, iconName);
    // console.log(jetpack.exists(iconPath)); //should be "file", otherwise you are not pointing to your icon file
    // let nimage = nativeImage.createFromPath(iconPath);
    // nimage = nimage.resize({'width': 16, 'height': 16})
    // console.log(nimage)
    tray = new Tray(getIcon('tray-icon-stopped.png',{'width': 16, 'height': 16}));
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
const openPage = (data)=>{
    require("electron").shell.openExternal(data).then(value => console.log('webpage opened'))
}
let icon_last, lastUpdate;
ipcMain.on('open-webpage',(event, data) => {
    openPage(data["link"])
});

ipcMain.on('app-update', (event, appStatus) => {
    let iconv;
    let isUpdate = false;
    switch (appStatus['icon']) {
        case 'running':
            iconv = 'tray-icon-running.png';
            isUpdate=true;
            break
        case 'working':
            iconv = 'tray-icon-working.png';
            break
        case 'error':
            isUpdate=true;
            iconv = 'tray-icon.png';
            break
        case 'stopped':
            isUpdate=true;
        default:
            iconv = 'tray-icon-stopped.png';
    }
    // console.log(iconv+","+appStatus['icon'])
    if (icon_last && icon_last === iconv)
        return;
    // console.log(iconv+" "+icon_last)
    // TODO fix notication when status changes from OFF to ON and vice versa
    // if(lastUpdate && icon_last && isUpdate && icon_last !== lastUpdate) {
    //     sendNotification('BLT Status Update', 'BLT Status Changed to ' + appStatus['icon'], () => {
    //         ipcRenderer.send('open-window', {'window': 'tray'}) // show window if notifaction is clicked
    //     })
    //     lastUpdate = icon_last
    // }
    lastUpdate = icon_last
    icon_last = iconv
    tray.setImage(getIcon(iconv,{'width': 16, 'height': 16}));
    tray.setToolTip(appStatus['tool-tip']?appStatus['tool-tip']:appStatus['icon']);
});
let browserWindow;
ipcMain.on('open-webpage-in-app',(event, data)=>{
     browserWindow = new BrowserWindow({
        width: 500,
        height: 500,
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
    browserWindow.loadURL(data['url']).then(value => console.log('webpage in app opened'))
    const position = getWindowPosition()
    browserWindow.setPosition(position.x, position.y, false)
    browserWindow.show()
    browserWindow.focus()
    const sendCheckSFM = () => script.send({'message': 'checkSFM'})
    const interval = setInterval(sendCheckSFM,1000)
    script.on('message',args => {
        if(args['sfm-needed'] === 'false') {
            browserWindow.close()
            clearInterval(interval);
            console.log('closed')
        }
    })
})
ipcMain.on('sfm-needed',(event, args) => {
    if(args==='true'){
        sendNotification('BLT SFM Needed',
            'Click here to log into TMP SFM or open a browser yourself and log in',
            ()=>{
                openPage('https://auth-crd.ops.sfdc.net/dana/home/index.cgi')
            }
        )
    }
})

ipcMain.handle('api', (event ,args)=> {
    let cmd;
    switch (args) {
        case 'restart-blt': cmd = blt.restartBlt(); break
        case 'check-health': cmd = blt.checkHealth(); break
        case 'is-need-sfm': cmd = blt.isNeedSFM(); break
        case 'kill-blt': 
        console.log("here i go killing again");
        cmd = blt.killblt(); break
        case 'start-blt': cmd = blt.start_blt(); break
        case 'build-blt': cmd = blt.build_blt(); break
        case 'sync-blt': cmd = blt.sync_blt(); break
        case 'enable-blt': cmd = blt.enable_blt(); break
        case 'disable-blt': cmd = blt.disable_blt(); break
        case 'build-blt': cmd = blt.build_blt(); break
        case 'dummy': cmd = blt.dummy(); break
        case 'quit': cmd = app.quit(); break
        default:
            // console.log(args)
            return
    }
    return cmd
})

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
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})