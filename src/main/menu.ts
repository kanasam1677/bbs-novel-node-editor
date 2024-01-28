import {BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';


// テンプレートからメニューを作成
export function CreateMenu(mainWindow:BrowserWindow){
    const isMac = process.platform === 'darwin'
    
    // メニューのテンプレート配列を作成
    const template: MenuItemConstructorOptions[] = [
        {
            label: 'File',
            submenu: [
                {label:'Save', accelerator:'CmdOrCtrl+S', click:()=>mainWindow.webContents.send("save", "save")},
                {label:'Open', accelerator:'CmdOrCtrl+O'},
                {label:'Export', accelerator:'CmdOrCtrl+E', click:()=>mainWindow.webContents.send("export", "str")},
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        { role: 'editMenu' },
        { role: 'viewMenu' },
        { role: 'windowMenu' },
        { role: 'help', submenu: [{ role: 'about' }] },
    ];
    
    // macOS では "アプリメニュー" が必要
    if (process.platform === 'darwin') template.unshift({ role: 'appMenu' });

    return Menu.buildFromTemplate(template);
}