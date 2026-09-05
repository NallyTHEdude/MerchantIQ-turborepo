import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
    const backendUrl =
        env.NEXT_PUBLIC_BACKEND_URL ||
        env.VITE_BACKEND_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        'http://localhost:5000';

    return {
        envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
        define: {
            'process.env.NEXT_PUBLIC_BACKEND_URL': JSON.stringify(backendUrl),
        },
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        server: {
            // HMR is disabled in AI Studio via DISABLE_HMR env var.
            // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
            hmr: process.env.DISABLE_HMR !== 'true',
            // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
            watch: process.env.DISABLE_HMR === 'true' ? null : {},
        },
    };
});
