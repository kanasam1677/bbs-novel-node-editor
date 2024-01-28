<script setup lang="ts">
import { EditorComponent as baklavaEditor } from "@baklavajs/renderer-vue";
import { useBaklava } from "@baklavajs/renderer-vue";
import "@baklavajs/themes/dist/syrup-dark.css";
import HelloWorld from './components/HelloWorld.vue'

import ReplyNode from "./components/ReplyNode";
import {ExportNode} from "./components/ExportNode"
import { DependencyEngine } from "baklavajs";
import { from } from "linq-to-typescript";

window.electronAPI.sendMessage('Hello from App.vue!');
const baklava = useBaklava();
baklava.editor.registerNodeType(ReplyNode);
baklava.settings.nodes.defaultWidth=400;
const engine = new DependencyEngine(baklava.editor);


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
      window.electronAPI.sendMessage(e.message);
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
