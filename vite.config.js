// vite.config.js
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
    include: ['five-bells-condition', 'crypto-browserify', 'buffer', 'process', 'create-hash'], // Add create-hash
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      plugins: [polyfillNode()],
      external: ['leaflet'],
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'src/login/login.html'),
        dashboard: resolve(__dirname, 'src/dashboard/dashboard.html'),
        wallet: resolve(__dirname, 'src/wallet/wallet.html'),
        'send-xrp': resolve(__dirname, 'src/send-xrp/send-xrp.html'),
        'escrow-payments': resolve(__dirname, 'src/escrow-payments/escrow-payments.html'),
        'buyer-purchases': resolve(__dirname, 'src/buyer-purchases/buyer-purchases.html'),
        'seller-escrows': resolve(__dirname, 'src/seller-escrows/seller-escrows.html'),
        'transaction-history': resolve(__dirname, 'src/transaction-history/transaction-history.html'),
        map: resolve(__dirname, 'src/map/map.html'),
        'delivery-status': resolve(__dirname, 'src/delivery-status/delivery-status.html'),
        register: resolve(__dirname, 'src/register/register.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
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
    historyApiFallback: {
      rewrites: [
        { from: /\/.*/, to: '/index.html' },
      ],
    },
    middlewareMode: false,
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        console.log(`[Vite Server] Request: ${req.method} ${req.url}`);
        next();
      });
    },
  },
});