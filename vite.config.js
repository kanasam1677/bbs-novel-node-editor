const Path = require('path');
const vuePlugin = require('@vitejs/plugin-vue')

const { resolve } = require('path')
const { defineConfig } = require('vite');

/**
 * https://vitejs.dev/config
 */
const config = defineConfig({
    root: Path.join(__dirname, 'src', 'renderer'),
    publicDir: 'public',
    server: {
        port: 8080,
    },
    open: false,
    build: {
        rollupOptions:{
            input:{
                main: resolve(__dirname, 'src', 'renderer', 'index.html'),
                license: resolve(__dirname, 'src', 'renderer', 'license.html'),
            }
        },
        outDir: Path.join(__dirname, 'build', 'renderer'),
        emptyOutDir: true,
    },
    plugins: [vuePlugin()],
});

module.exports = config;
