<script setup lang="ts">
import { EditorComponent as baklavaEditor } from "@baklavajs/renderer-vue";
import { useBaklava } from "@baklavajs/renderer-vue";
import "@baklavajs/themes/dist/syrup-dark.css";
import HelloWorld from './components/HelloWorld.vue'

import ReplyNode from "./components/ReplyNode";
import SettingNode from "./components/SettingNode";
import {ExportNode} from "./components/ExportNode"
import { DependencyEngine } from "baklavajs";
import { from } from "linq-to-typescript";

window.electronAPI.sendMessage('Hello from App.vue!');
const baklava = useBaklava();
baklava.editor.registerNodeType(ReplyNode);
baklava.editor.registerNodeType(SettingNode);
baklava.settings.nodes.defaultWidth=400;
const engine = new DependencyEngine(baklava.editor);


function onKeyDown(ev:KeyboardEvent){
  if(document.activeElement?.classList.contains("baklava-input")??false)
    return;

  //HACK:Typescriptのpannning,scalingが存在しない旨の警告を抑制
  //     positionはAbstructNodeにrenderer-vueにて後付けされている？？がそれを参照する方法がわからない
  //     https://github.com/newcat/baklavajs/blob/60f0c88a462c21536ffe99803974f6d38c945b70/packages/renderer-vue/src/overrides.d.ts#L36
  switch(ev.code){
    case "KeyW":
      // @ts-ignore
      baklava.displayedGraph.panning.y += 10; 
      break;
    case "KeyA":
      // @ts-ignore
      baklava.displayedGraph.panning.x += 10; 
      break;
    case "KeyS":
      // @ts-ignore
      baklava.displayedGraph.panning.y -= 10; 
      break;
    case "KeyD":
      // @ts-ignore
      baklava.displayedGraph.panning.x -= 10; 
      break;
    default:
        break;
  }
}
window.addEventListener("keydown",onKeyDown);

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
  <div style="width: 100vw; height: 100vh">
    <baklavaEditor :view-model="baklava" />
  </div>
</template>

<style>
#app{
  margin: 0;
  padding:0;
}
button[title$="Subgraph"]{
  visibility: hidden;
}
</style>
