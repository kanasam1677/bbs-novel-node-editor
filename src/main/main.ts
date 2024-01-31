import {app, BrowserWindow, ipcMain, session, Menu, dialog} from 'electron';
import fs from "node:fs/promises";
import {join} from 'path';
import { CreateMenu } from './menu';
import * as child_process from "node:child_process";

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
      //defaultPath: app.getPath('documents'),
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
    let filePath = result.filePath??"";
    if(!filePath.endsWith(".txt"))//拡張子をtxtに強制して攻撃防止…？
      filePath = filePath + ".txt";
    fs.writeFile(
      filePath,
      contents,
    ).then(()=>{
      console.log(`${type} completed`);
      //WARNING:execを外部からの入力に対して使用している
      //        (execFileは安全だがエディタのexeを指定する必要があるため既定のエディタで自動で開きたい場合使用できない？)
      //        ・showSaveDialogのほうでファイル名に使用できない文字等ある程度のサニタイズはかかるようだがこれで完全かは不明
      //        ・拡張子を変更して実行させる攻撃の対策として拡張子.txtを強制付加しているが完全かは不明
      child_process.exec(filePath);
    })
    .catch((reason)=>console.log(reason));
  });
})