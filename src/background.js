'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import fs from 'fs'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      // contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
      // webSecurity: false,
      // nodeIntegration: true,
      preload: __dirname + '/preload.js'
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
    // createProtocol('app')

    // win.loadURL('../dist/index.html')

  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

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
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS_DEVTOOLS)
  //   } catch (e) {
  //     console.error('Vue Devtools failed to install:', e.toString())
  //   }
  // }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.on('save', (event, data) => {
  console.log(data)
  let options = {
    title: "????????????",
    buttonLabel: "??????",
    defaultPath: "C://",
    filters: [
      data.filter,
    ]
  };
  dialog.showSaveDialog(options).then(result => {
    console.log(result)
    if (!result.canceled) {
      fs.writeFile(result.filePath, data.text, function (err) {
        if (err) {
          return event.sender.send('save-faild')
        }
        return event.sender.send('save-success')
      })
    }
  })
})

ipcMain.on('loadc', (event) => {
  let options = {
    title: "????????????",
    buttonLabel: "??????",
    defaultPath: "C://",
    filters: [
      { name: 'C', extensions: ['c'] },
    ]
  };
  dialog.showOpenDialog(options).then(result => {
    console.log(result)
    if (!result.canceled) {
      fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
        if (err) {
          return event.sender.send('read-faild');
        }
        console.log('????????????', data)
        return event.sender.send('read-success', data);
      })
    }
  })
})




