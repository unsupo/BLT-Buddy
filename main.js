'use strict';

const {mkdirp} = require("fs-extra");
const fs = require('fs')

const {ipcRenderer, ipcMain, app, BrowserWindow, Tray, nativeImage, Notification} = require('electron');
const path = require('path');
const blt = require('./scripts/blt')

const assetsDirectory = path.join(__dirname, 'assets', 'icons', 'png')

const appFolder = path.dirname(process.execPath)
const updateExe = path.resolve(appFolder, '..', 'Update.exe')
const exeName = path.basename(process.execPath)
const cmd = require('./scripts/cmd')


const fixPath = require('fix-path')
require('./scripts/constants')
const {command} = require("./scripts/cmd");

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
let uipage;

// actions to do on application start up
const startUp = () => {
    mkdirp(constants.basedir)
    mkdirp(constants.piddir)
    mkdirp(constants.logdir)
    mkdirp(constants.scriptsdir)
    mkdirp(constants.cmdlogdir)
    mkdirp(constants.cmddir)
    mkdirp(constants.cmdexitdir)
    mkdirp(constants.docdir)
    if(fs.existsSync(constants.projectFile)) {
        const dir = fs.readFileSync(constants.projectFile).toString()
        blt.set_project(dir)
    }else
        blt.set_project('app/main').then(dir=>console.log(dir))
    // command(`ln -sf ${constants.bltdocsdir} ${constants.docdir}`)
    if(!fs.existsSync(constants.bltdir))
        uipage = 'Installer'
}

app.whenReady()
    .then(startUp)
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
            backgroundThrottling: false,
            preload: __dirname + '/preload.js'
        },
        icon: getIcon('apple-icon.png',{'width': 512, 'height': 512})
    })
    // win.loadFile(__dirname + "/build/index.html");
    win.loadURL('http://localhost:3000')
    let isQuitting = false;
    app.on('before-quit',event => win.removeAllListeners())
    win.addListener('close',(event)=>{
        if(!isQuitting) {
            event.preventDefault()
            win.hide()
            event.returnValue = false
        }
    })
    win.on('closed', () => {
        win = null
    })
    // win.on('closed',()=>win=null)
    return win
}

const getTrayWindow = () =>{
    if(tray_window)
        return tray_window
    return createTrayWindow()
}

function createTrayWindow() {
    // tray height is based on number of elements in tray-display.json
    // tray width is based on max number elements in elements in tray-display.json
    tray_window = new BrowserWindow({
        width: 220,
        height: 350,
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
    return tray_window
}

const sendNotification = (title,body,onclick) => {
    let notification = new Notification({
        title: title,
        body: body
    })
    if(onclick)
        notification.on('click', onclick)
    return notification
    // notification.show()
}

const getIcon = (relpath,size) =>{
    let nimage = nativeImage.createFromPath(path.join(assetsDirectory,relpath))
    nimage = nimage.resize(size)
    return nimage
}

function createTray() {
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

ipcMain.handle('ui',(args)=>{
    // pass in the ui page to remember page you were on
    // if blt isn't installed start on the installer page
    if(uipage)
        return {page: uipage, details: 'not installed'}
    if(args){

    }
})

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
    switch (appStatus['icon']) {
        case 'running': iconv = 'tray-icon-running.png'; break
        case 'working': iconv = 'tray-icon-working.png'; break
        case 'error': iconv = 'tray-icon.png'; break
        case 'stopped':
        default:
            iconv = 'tray-icon-stopped.png';
    }
    if (appStatus['notification']) {
        let click;
        if(appStatus['notification']['onclick'] && appStatus['notification']['onclick']['key'])
            try {
                switch (appStatus['notification']['onclick']['key']) {
                    case 'open-file':
                        click = () => require('electron').shell.openItem(appStatus['notification']['onclick']['value'])
                }
            }catch(err){
                console.log(appStatus)
                console.log(err)
            }
        sendNotification(appStatus['notification']['title'], appStatus['notification']['body'], click).show()
    }
    if (icon_last && icon_last === iconv)
        return;
    if(lastStatus === 'stopped' && appStatus['icon'] === 'running' ||
        lastStatus === 'running' && appStatus['icon'] === 'stopped')
        sendNotification('BLT Status Update', 'BLT Status Changed to ' + appStatus['icon'], () => {
            ipcRenderer.send('open-window',
                appStatus['icon'] === 'stopped' ? {'window': 'tray'} : openPage('http://localhost:6109'))
        }).show()
    lastUpdate = icon_last
    icon_last = iconv
    tray.setImage(getIcon(iconv,{'width': 16, 'height': 16}));
    tray.setToolTip(appStatus['tool-tip']?appStatus['tool-tip']:appStatus['icon']);
});
let lastStatus;
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

// let notification;
ipcMain.handle('sfm-needed',(event, args) => {
    if(args)
        return new Promise(resolve => {
            sendNotification('BLT SFM Needed',
                'Click here to log into TMP SFM or open a browser yourself and log in',
                ()=>{
                    console.log('click handled')
                    openPage('https://auth-crd.ops.sfdc.net/dana/home/index.cgi')
                }
            ).show()
            resolve('true')
        })
    return new Promise(resolve => resolve('false'))
})
let runningCmd;
ipcMain.handle('api', (event ,args)=> {
    let cmdlocal;
    switch (args['cmd']) {
        case 'restart-blt': cmdlocal = blt.restartBlt(); break
        case 'check-health': cmdlocal = blt.checkHealth(); break
        case 'is-need-sfm': cmdlocal = blt.isNeedSFM(); break
        case 'kill-blt': cmdlocal = blt.killblt(args['args']['timeout']); break
        case 'start-blt': cmdlocal = blt.start_blt(); break
        case 'build-blt': cmdlocal = blt.build_blt(); break
        case 'sync-blt': cmdlocal = blt.sync_blt(); break
        case 'enable-blt': cmdlocal = blt.enable_blt(); break
        case 'disable-blt': cmdlocal = blt.disable_blt(); break
        case 'set-project': cmdlocal = blt.set_project(args['args']['dir']); break
        case 'kill-command': cmdlocal = cmd.killcmd(blt.getCommand(args['args']['cmd'])); break
        case 'get_project_dirs': cmdlocal = blt.get_project_dirs(); break
        case 'get_project': cmdlocal = blt.get_project(); break
        case 'get_project_dir_status': cmdlocal = blt.get_project_dir_status(); break
        case 'quit': cmdlocal = app.quit(); break
        default:
            // console.log(args)
            return
    }
    runningCmd = args['cmd']
    return cmdlocal
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