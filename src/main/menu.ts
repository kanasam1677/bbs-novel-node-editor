import {BrowserWindow, Menu, MenuItemConstructorOptions, app, dialog, KeyboardInputEvent} from 'electron';
import fs from "node:fs/promises";

function LoadClicked(mainWindow:BrowserWindow){
    console.log("load started");
    dialog.showOpenDialog(
        {
            //defaultPath: app.getPath('documents'),
            filters: [{
                extensions: ['json'],
                name: 'ノードエディタ状態保存ファイル',
              },
            ],
            properties: ['openFile'],
        }
    ).then((result)=>{
        if (result.canceled){
            console.log(`load cancelled`);
            return;
        }
        if(result.filePaths.length!=1){
            throw new Error("wrong filenum")
        }
        fs.readFile(
        result.filePaths[0]
        ).then((content)=>{
            const contentStr = content.toString();
            mainWindow.webContents.send("load", contentStr);
        })
        .catch((reason)=>console.log(reason));
    });
}

// テンプレートからメニューを作成
export function CreateMenu(mainWindow:BrowserWindow){
    const isMac = process.platform === 'darwin'
    
    // メニューのテンプレート配列を作成
    const template: MenuItemConstructorOptions[] = [
        {
            label: 'File',
            submenu: [
                {label:'Save', accelerator:'CmdOrCtrl+S', click:()=>mainWindow.webContents.send("save", "save")},
                {label:'Open', accelerator:'CmdOrCtrl+O', click:()=>LoadClicked(mainWindow)},
                {label:'Export', accelerator:'CmdOrCtrl+E', click:()=>mainWindow.webContents.send("export", "str")},
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
              { label: 'Undo', click:()=>mainWindow.webContents.send("command", "undo") },
              { label: 'Redo', click:()=>mainWindow.webContents.send("command", "redo")  },
              { type: 'separator' },
              { label: 'Copy', click:()=>mainWindow.webContents.send("command", "copy")  },
              { label: 'Paste', click:()=>mainWindow.webContents.send("command", "paste")  },
              { type: 'separator' },
              { label: 'Delete', click:()=>mainWindow.webContents.send("command", "delete")   },
            ]
        },
        { role: 'viewMenu' },
        { role: 'windowMenu' },
        { role: 'help', submenu: [{ role: 'about' }] },
    ];
    
    // macOS では "アプリメニュー" が必要
    if (process.platform === 'darwin') template.unshift({ role: 'appMenu' });

    return Menu.buildFromTemplate(template);
}