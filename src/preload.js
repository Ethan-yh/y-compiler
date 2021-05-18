import { ipcRenderer } from 'electron'
window.ipcRenderer = ipcRenderer
console.log('preload')
console.log(window)