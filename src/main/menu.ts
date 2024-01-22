import { Menu, MenuItemConstructorOptions } from 'electron';

const isMac = process.platform === 'darwin'

// メニューのテンプレート配列を作成
const template: MenuItemConstructorOptions[] = [
    {
        label: 'File',
        submenu: [
            {label:'Save', accelerator:'CmdOrCtrl+S'},
            {label:'Open', accelerator:'CmdOrCtrl+O'},
            {label:'Export', accelerator:'CmdOrCtrl+E'},
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

// テンプレートからメニューを作成
export const menu = Menu.buildFromTemplate(template);