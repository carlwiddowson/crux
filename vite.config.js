import { defineConfig } from 'vite';
import polyfillNode from 'rollup-plugin-polyfill-node';
import { resolve } from 'path';
import { readFileSync } from 'fs';

function loadEnvFile() {
  try {
    const envContent = readFileSync('.env', 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) env[key.trim()] = value.trim();
    });
    return env;
  } catch (error) {
    console.error('Error loading .env file:', error);
    return {};
  }
}

const env = loadEnvFile();

export default defineConfig({
  root: './',
  define: {
    'process.env': JSON.stringify(env),
    'global': 'globalThis',
    'process': {
      env: env,
      browser: true,
      cwd: () => '/',
      nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    include: ['five-bells-condition', 'crypto-browserify', 'buffer', 'process'],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      plugins: [polyfillNode()],
      input: {
        main: 'index.html',
      },
    },
  },
  resolve: {
    alias: {
      ws: 'xrpl/dist/npm/client/WSWrapper',
      'five-bells-condition': 'five-bells-condition',
      crypto: resolve(__dirname, 'node_modules/crypto-browserify'),
      buffer: resolve(__dirname, 'node_modules/buffer'),
      process: resolve(__dirname, 'node_modules/process'),
      'dotenv': false,
    },
  },
  server: {
    historyApiFallback: true,
  },
});