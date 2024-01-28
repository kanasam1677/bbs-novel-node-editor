import {app, BrowserWindow, ipcMain, session, Menu, dialog} from 'electron';
import fs from "node:fs/promises";
import {join} from 'path';
import { CreateMenu } from './menu';

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
  }
  else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
  }
  Menu.setApplicationMenu(CreateMenu(mainWindow));
}

app.whenReady().then(() => {
  createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\'']
      }
    })
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('message', (event, message) => {
  console.log(message);
})

ipcMain.on('errorMessage', (event, title, content) => {
  dialog.showErrorBox(title, content);
})

ipcMain.on('saveOnFile', (event, contents, type) => {
  dialog.showSaveDialog(
    {
      defaultPath: app.getPath('documents'),
      filters: [(type=='export')?
        {
          extensions: ['txt'],
          name: 'txt ファイル',
        }:{
          extensions: ['json'],
          name: 'ノードエディタ状態保存ファイル',
        },
      ],
    }
  ).then((result)=>{
    if (result.canceled || !result.filePath){
      console.log(`${type} cancelled`);
      return;
    }
    fs.writeFile(
      result.filePath,
      contents,
    ).then(()=>console.log(`${type} completed`))
    .catch((reason)=>console.log(reason));
  });
})