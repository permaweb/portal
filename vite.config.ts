import react from '@vitejs/plugin-react';
import path from 'path';
import polyfillNode from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
	plugins: [
		nodePolyfills({
			protocolImports: true,
		}),
		react(),
		viteSingleFile(),
	],
	resolve: {
		alias: {
			react: path.resolve(__dirname, 'node_modules/react'),
			app: path.resolve(__dirname, 'src/app/'),
			arweave: path.resolve(__dirname, 'node_modules/arweave'),
			assets: path.resolve(__dirname, 'src/assets'),
			components: path.resolve(__dirname, 'src/components'),
			helpers: path.resolve(__dirname, 'src/helpers'),
			hooks: path.resolve(__dirname, 'src/hooks'),
			navigation: path.resolve(__dirname, 'src/navigation'),
			providers: path.resolve(__dirname, 'src/providers'),
			root: path.resolve(__dirname, 'src/root'),
			routes: path.resolve(__dirname, 'src/routes'),
			store: path.resolve(__dirname, 'src/store'),
			views: path.resolve(__dirname, 'src/views'),
			wallet: path.resolve(__dirname, 'src/wallet'),
			wrappers: path.resolve(__dirname, 'src/wrappers'),
			process: 'vite-plugin-node-polyfills/polyfills/process-es6',
			buffer: 'vite-plugin-node-polyfills/polyfills/buffer',
			crypto: 'vite-plugin-node-polyfills/polyfills/crypto',
			stream: 'vite-plugin-node-polyfills/polyfills/stream',
			util: 'vite-plugin-node-polyfills/polyfills/util',
			path: 'vite-plugin-node-polyfills/polyfills/path',
			events: 'vite-plugin-node-polyfills/polyfills/events',
			timers: 'vite-plugin-node-polyfills/polyfills/timers',
			http: 'vite-plugin-node-polyfills/polyfills/http',
			https: 'vite-plugin-node-polyfills/polyfills/http',
			os: 'vite-plugin-node-polyfills/polyfills/os',
			assert: 'vite-plugin-node-polyfills/polyfills/assert',
			zlib: 'vite-plugin-node-polyfills/polyfills/zlib',
			constants: 'vite-plugin-node-polyfills/polyfills/constants',
		},
	},
	optimizeDeps: {
		include: ['buffer', 'process', 'crypto', 'stream', 'util'],
	},
	build: {
		outDir: 'dist',
		sourcemap: process.env.NODE_ENV !== 'production',
		rollupOptions: {
			plugins: [polyfillNode()],
		},
	},
	server: {
		port: 3000,
		open: false,
		strictPort: true,
		hmr: true,
	},
});
