/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
  sendMessage: (message: string) => void,
  sendErrorMessage: (title: string, content: string) => void,
  saveOnFile: (contents: string, type: string) => void,
  openBrowser: (url:string) => void,
  onExport(value:any):void;
  onSave(value:any):void;
  onLoad(contentStr:any):void;
  onCommand(commandStr:any):void;
}

declare global {
  interface Window {
    electronAPI: ElectronApi,
  }
}
