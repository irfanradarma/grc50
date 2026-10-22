import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
// Preserve the browser-facing Host so the API can validate same-origin local requests.
export default defineConfig({base:process.env.VITE_BASE_PATH||'/',plugins:[react()],server:{port:80,strictPort:true,proxy:{'/api':{target:'http://127.0.0.1:3001',changeOrigin:false},'/presentation':{target:'http://127.0.0.1:3001',changeOrigin:false}}},build:{outDir:'dist'}});
