'use strict';

const {ipcMain, app,BrowserWindow, Tray, nativeImage, Notification} = require('electron');
const path = require('path');
const jetpack = require('fs-jetpack');
const cmd =  require('./cmd');

const assetsDirectory = path.join(__dirname, 'assets','icons','png')

app.allowRendererProcessReuse = true;
let tray = undefined;
let tray_window = undefined;
let win = undefined;

app.whenReady().then(createWindow).then(createTray).then(createTrayWindow).then(()=>{
    // Now we can run a script and invoke a callback when complete, e.g.
    // run the server
    cmd.runScript('./app.js', function (err) {
        if (err) throw err;
        console.log('finished running some-script.js');
    });
}).catch(reason => console.log(reason));

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        icon: path.join(assetsDirectory,'app64.png')
    })
    win.loadFile( __dirname+"/build/index.html");
}

function createTrayWindow() {
    tray_window = new BrowserWindow({
        width: 300,
        height: 450,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            // Prevents renderer process code from not running when window is
            // hidden
            backgroundThrottling: false
        }
    })
    tray_window.loadFile( __dirname+"tray-window/build/index.html");

    // Hide the window when it loses focus
    window.on('blur', () => {
        if (!window.webContents.isDevToolsOpened()) {
            window.hide()
        }
    })
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
    const iconName = 'tray-icon.png';
    const iconPath = path.join(assetsDirectory,iconName);
    console.log(jetpack.exists(iconPath)); //should be "file", otherwise you are not pointing to your icon file
    let nimage = nativeImage.createFromPath(iconPath);
    nimage = nimage.resize({'width': 16, 'height': 16})
    console.log(nimage)
    tray = new Tray(nimage);
    // tray.on('click',(event => notify()))

    tray.on('right-click', toggleWindow)
    tray.on('double-click', toggleWindow)
    tray.on('click',(event => toggleWIndow()))
}
const toggleWindow = () => {
    if (tray_window.isVisible()) {
        tray_window.hide()
    } else {
        showWindow()
    }
}

const showWindow = () => {
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
    showWindow()
})
ipcMain.on('app-update',(event, appStatus) => {
    let iconv = undefined;
    switch (appStatus.currenlty.icon) {
        case 'running':
            iconv = 'tray-icon-running.png';
            break
        case 'stopped':
            iconv = 'tray-icon-stopped.png';
            break
        case 'working':
            iconv = 'tray-icon-working.png';
            break
        default:
            iconv = 'tray-icon.png';
    }
    tray.setImage(path.join(assetsDirectory,'tray-icon-.png'))
});

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