import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  sendErrorMessage: (title: string, content: string) => ipcRenderer.send('errorMessage', title, content),
  saveOnFile: (contents: string, type: string) => ipcRenderer.send('saveOnFile', contents, type),
  onExport: (callback) => ipcRenderer.on('export', (_event, value)=> callback(value)),
  onSave: (callback) => ipcRenderer.on('save', (_event, value)=> callback(value)),
  onLoad: (callback) => ipcRenderer.on('load', (_event, contentStr)=> callback(contentStr)),
  onCommand: (callback) => ipcRenderer.on('command', (_event, commandStr)=> callback(commandStr)),
})
