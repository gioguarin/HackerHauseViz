import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            input: {
                main: './index-modular.html'
            }
        }
    },
    server: {
        port: 8000,
        open: true
    }
});
