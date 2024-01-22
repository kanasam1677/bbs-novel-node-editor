<script setup lang="ts">
import { EditorComponent as baklavaEditor } from "@baklavajs/renderer-vue";
import { useBaklava } from "@baklavajs/renderer-vue";
import "@baklavajs/themes/dist/syrup-dark.css";
import HelloWorld from './components/HelloWorld.vue'

import ReplyNode from "./components/ReplyNode";

window.electronAPI.sendMessage('Hello from App.vue!');
const baklava = useBaklava();
baklava.editor.registerNodeType(ReplyNode);
baklava.settings.nodes.defaultWidth=400;

window.electronAPI.onExport((value:any)=>{
  window.electronAPI.sendMessage('export started');
}
);

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
