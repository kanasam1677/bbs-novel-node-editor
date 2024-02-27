<script setup lang="ts">
import { ref } from 'vue';
import itemsjson from './licenses.json'

function sendOpenBrowser(url:string){
    window.electronAPI.openBrowser(url);
}
const items = ref(itemsjson) 
</script>
<template>
    <div>
        <p>
            MIT License<br>
            Copyright (c) 2024 kanasam1677
        </p>
        <p class="license-sentence">
            Permission is hereby granted, free of charge, to any person obtaining a copy<br>
            of this software and associated documentation files (the "Software"), to deal<br>
            in the Software without restriction, including without limitation the rights<br>
            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell<br>
            copies of the Software, and to permit persons to whom the Software is<br>
            furnished to do so, subject to the following conditions:<br>
            <br>
            The above copyright notice and this permission notice shall be included in all<br>
            copies or substantial portions of the Software.<br>
            <br>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR<br>
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,<br>
            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE<br>
            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER<br>
            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,<br>
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE<br>
            SOFTWARE.<br>
        </p>
        <hr>
    </div>
    <div v-for="item in itemsjson">
        <p>
            {{ item.name }}:{{ item.version }}({{ item.licenses }})<br>
            {{ item.copyright }}<br>
            <a href="#" @click.prevent.stop="sendOpenBrowser(item.repository)">{{ item.repository }}</a>
        </p>
        <p class="license-sentence">
            {{ item.licenseText.replace("\\n","\n") }}
        </p>
    </div>
</template>
<style scoped>
.license-sentence{
    font-size: xx-small;
    color: grey;
    white-space: pre-line;
}
</style>