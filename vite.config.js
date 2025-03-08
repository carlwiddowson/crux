// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import polyfillNode from 'rollup-plugin-polyfill-node';

const viteConfig = ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, '', '') };
    return defineConfig({
        root: './', // Explicitly set the root to the project directory
        define: {
            'process.env': process.env,
        },
        optimizeDeps: {
            esbuildOptions: {
                define: {
                    global: 'globalThis',
                },
            },
        },
        build: {
            outDir: 'dist', // Output directory for the build
            rollupOptions: {
                plugins: [polyfillNode()],
                input: {
                    main: 'index.html', // Explicitly define the entry point
                },
            },
        },
        resolve: {
            alias: {
                ws: 'xrpl/dist/npm/client/WSWrapper',
            },
        },
        server: {
            // Enable SPA routing in development
            historyApiFallback: true, // Serve index.html for all routes
        },
    });
};

export default viteConfig;