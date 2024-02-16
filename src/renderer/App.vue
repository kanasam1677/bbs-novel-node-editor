<script setup lang="ts">
import { EditorComponent as baklavaEditor } from "@baklavajs/renderer-vue";
import { useBaklava, Commands} from "@baklavajs/renderer-vue";
import "@baklavajs/themes/dist/syrup-dark.css";
import HelloWorld from './components/HelloWorld.vue'

import ReplyNode from "./components/ReplyNode";
import SettingNode from "./components/SettingNode";
import DescriptiveNode from "./components/DescriptiveNode";
import {ExportNode} from "./components/ExportNode"
import { DependencyEngine } from "baklavajs";
import { from } from "linq-to-typescript";
import { ref, watch } from "vue";

window.electronAPI.sendMessage('Hello from App.vue!');
const baklava = useBaklava();
baklava.editor.registerNodeType(ReplyNode);
baklava.editor.registerNodeType(SettingNode);
baklava.editor.registerNodeType(DescriptiveNode);
baklava.settings.nodes.defaultWidth=400;
const engine = new DependencyEngine(baklava.editor);

const pressedKeyList = new Set<string>();
function onKeyDown(ev:KeyboardEvent){
  switch(ev.code){
    case "KeyW":
    case "KeyA":
    case "KeyS":
    case "KeyD":
      pressedKeyList.add(ev.code)
    default:
        break;
  }
}
function onKeyUp(ev:KeyboardEvent){
  switch(ev.code){
    case "KeyW":
    case "KeyA":
    case "KeyS":
    case "KeyD":
      pressedKeyList.delete(ev.code)
    default:
        break;
  }
}
function onKeyInterval(){
  //HACK:Typescriptのpanning,scalingが存在しない旨の警告を抑制
  //     positionはAbstructNodeにrenderer-vueにて後付けされている？？がそれを参照する方法がわからない
  //     https://github.com/newcat/baklavajs/blob/60f0c88a462c21536ffe99803974f6d38c945b70/packages/renderer-vue/src/overrides.d.ts#L36
  const speed = 10;
  // @ts-ignore
  const scaledSpeed = speed * (1.0/baklava.displayedGraph.scaling); 
  if(document.activeElement?.classList.contains("baklava-input")??false)
    return;

  if(pressedKeyList.has("KeyW")){
    // @ts-ignore
    baklava.displayedGraph.panning.y += scaledSpeed; 
  }
  if(pressedKeyList.has("KeyA")){
    // @ts-ignore
    baklava.displayedGraph.panning.x += scaledSpeed; 
  }
  if(pressedKeyList.has("KeyS")){
    // @ts-ignore
    baklava.displayedGraph.panning.y -= scaledSpeed; 
  }
  if(pressedKeyList.has("KeyD")){
    // @ts-ignore
    baklava.displayedGraph.panning.x -= scaledSpeed; 
  }
}
window.addEventListener("keydown",onKeyDown);
window.addEventListener("keyup",onKeyUp);
setInterval(onKeyInterval,10);


window.electronAPI.onExport((value:any)=>{
  window.electronAPI.sendMessage('export started');
  ExportNode(baklava.editor.graph.nodes, baklava.editor, engine).then((result)=>
  {
    window.electronAPI.saveOnFile(result, 'export');
  });
});

window.electronAPI.onSave((type:string)=>{
  window.electronAPI.sendMessage('save started');
  const saveData = baklava.editor.save();
  window.electronAPI.saveOnFile(JSON.stringify(saveData), type);
});

window.electronAPI.onLoad((contentStr:string)=>{
  window.electronAPI.sendMessage('load data recieved');
  window.electronAPI.sendMessage(contentStr);
  try{
    const jsonObj = JSON.parse(contentStr);
    const result = baklava.editor.load(jsonObj);
    if(result.length!=0)
      throw new SyntaxError(from(result).aggregate((a,b)=>a+'\n'+b));
    window.electronAPI.sendMessage('load completed');
  }catch(e :unknown){
    if(e instanceof SyntaxError || e instanceof TypeError){
      window.electronAPI.sendErrorMessage('ファイル読み込み失敗', 'ファイルの読み込みに失敗しました。\n'+e.message);
    }
    else{
      throw e;
    }
  }
});

window.electronAPI.onCommand((commandStr:string)=>{
  switch(commandStr){
    case 'undo':
      baklava.commandHandler.executeCommand<Commands.UndoCommand>(Commands.UNDO_COMMAND);
      break;
    case 'redo':
      baklava.commandHandler.executeCommand<Commands.RedoCommand>(Commands.REDO_COMMAND);
      break;
    case 'copy':
      baklava.commandHandler.executeCommand<Commands.CopyCommand>(Commands.COPY_COMMAND);
      break;
    case 'paste':
      baklava.commandHandler.executeCommand<Commands.PasteCommand>(Commands.PASTE_COMMAND);
      break;
    case 'delete':
      baklava.commandHandler.executeCommand<Commands.DeleteNodesCommand>(Commands.DELETE_NODES_COMMAND);
      break;
    default:
      throw new Error('not implemented');
  }
});
let activeTab = ref("editor");
let previewStr = ref("文字列");
watch(activeTab, ()=>{
  if(activeTab.value == 'preview'){
    previewStr.value = '処理中…';
    window.electronAPI.sendMessage('preview started');
    ExportNode(baklava.editor.graph.nodes, baklava.editor, engine).then((result)=>
    {
      previewStr.value = result;
    });
  }
})
</script>

<template>
  <!--
    <div>
      <a href="https://vitejs.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img src="/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
    </div>
    <HelloWorld msg="Vite + Vue" />
  -->
  <div id = "app">
    <div class="tabs">
      <div v-bind:class="{'active-tab': activeTab == 'editor'}">
        <input id="tab_editor" type="radio" name="tab_item" v-model="activeTab" value="editor">
        <label class="tab_item" for="tab_editor">エディター</label>
      </div>
      <div v-bind:class="{'active-tab': activeTab == 'preview'}">
        <input id="tab_preview" type="radio" name="tab_item" v-model="activeTab" value="preview">
        <label class="tab_item" for="tab_preview">プレビュー</label>    
      </div>
    </div>
    <div class="tab_contents" >
      <div v-if="activeTab == 'editor'" >
        <div style="width: 100vw; height: calc(100vh - 70px)"><baklavaEditor :view-model="baklava" />
        </div>
      </div>
      <div v-else-if="activeTab == 'preview'">
        <div id="preview_box"><p>{{ previewStr }}</p></div>
      </div>
    </div>
  </div>
  <!--

    <div style="width: 100vw; height: 100vh">
      <baklavaEditor :view-model="baklava" />
    </div>
  -->
</template>

<style>
#app{
  margin: 0;
  padding:0;
}
button[title$="Subgraph"]{
  visibility: hidden;
}
.tabs {
  margin-top: 50px;
  padding-bottom: 40px;
  margin: 0 auto;
}
.tab_item {
  width: calc(100%/3);
  height: 50px;
  border-bottom: 3px solid #5ab4bd;
  background-color: #d9d9d9;
  line-height: 50px;
  font-size: 16px;
  text-align: center;
  color: #565656;
  display: block;
  float: left;
  text-align: center;
  font-weight: bold;
  transition: all 0.2s ease;
}
.tab_item:hover {
  opacity: 0.75;
}
input[name="tab_item"] {
  display: none;
}
.active-tab *{
  background-color: #5ab4bd;
  color: #fff;
}
.tab_contents{
  width: 100vw;
  height:calc(100vh - 50px);
}
#preview_box{
  background:#fffade;
  text-align: left;
  white-space: pre-line;
}

</style>
