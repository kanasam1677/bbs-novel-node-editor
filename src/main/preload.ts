import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  onExport: (callback) => ipcRenderer.on('export', (_event, value)=> callback(value)),
})
