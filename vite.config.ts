import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import polyfillNode from 'rollup-plugin-polyfill-node';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	const app = env.VITE_APP;

	if (!app) throw new Error(`VITE_APP must be set to 'editor', 'viewer', 'engine', or 'engine-lite'.`);

	const root = path.resolve(__dirname, `src/apps/${app}`);

	const config: any = {
		editor: {
			port: 3000,
			build: {
				sourcemap: false,
				cssCodeSplit: false,
				outDir: path.resolve(__dirname, `dist/${app}`),
				emptyOutDir: true,
				rollupOptions: {
					input: path.resolve(root, 'index.html'),
					plugins: [
						polyfillNode(),
						{
							name: 'copy-service-worker',
							generateBundle() {
								const swPath = path.resolve(__dirname, 'public/service-worker.js');
								if (fs.existsSync(swPath)) {
									this.emitFile({ type: 'asset', fileName: 'service-worker.js', source: fs.readFileSync(swPath) });
								}
							},
						},
					],
					output: {
						onlyExplicitManualChunks: true,
						manualChunks: (id: string) => {
							const modulePath = id.replace(/\\/g, '/').split('?')[0];
							// Keep the bootstrap with SDKs so their source evaluation order is preserved:
							// installing fetch in a separate chunk can run after SDKs capture native fetch.
							if (/\/src\/helpers\/gateway(?:RateLimit|FetchBootstrap)\.ts$/.test(modulePath)) {
								return 'vendor';
							}
							// Dependencies import these shims; putting them in the UI would create a cycle.
							if (/\/src\/helpers\/(?:globalthis|winston-shim)\.ts$/.test(modulePath)) return 'vendor';
							if (
								modulePath.includes('/node_modules/@monaco-editor/') ||
								modulePath.endsWith('/src/components/molecules/JSONEditor/JSONEditor.tsx')
							) {
								return 'code-editor';
							}
							if (modulePath.includes('/node_modules/@stripe/')) return 'payments';
							if (modulePath.includes('/node_modules/@wanderapp/connect/')) return 'wander';
							if (modulePath.includes('/node_modules/')) return 'vendor';
							// Coalesce route components, shared UI, translations, and documentation:
							// a navigation should not fan out into dozens of tiny gateway requests.
							if (modulePath.includes('/src/') || modulePath.includes('/scripts/')) return 'portal-ui';
							return 'vendor';
						},
					},
				},
			},
		},
		engine: {
			port: 4000,
			build: {
				outDir: path.resolve(__dirname, `dist/${app}`),
				emptyOutDir: true,
				cssCodeSplit: false,
				assetsInlineLimit: 10_000_000,
				modulePreload: false,
				rollupOptions: {
					input: path.resolve(root, 'index.tsx'),
					plugins: [polyfillNode()],
					output: {
						inlineDynamicImports: true,
						manualChunks: undefined,
						entryFileNames: `bundle.js`,
						chunkFileNames: `bundle.js`,
						assetFileNames: `[name][extname]`,
						format: 'iife',
					},
				},
			},
		},
		'engine-lite': {
			port: 4100,
			build: {
				outDir: path.resolve(__dirname, `dist/${app}`),
				emptyOutDir: true,
				cssCodeSplit: false,
				assetsInlineLimit: 10_000_000,
				modulePreload: false,
				rollupOptions: {
					input: path.resolve(root, 'index.ts'),
					plugins: [
						{
							name: 'copy-engine-lite-service-worker',
							generateBundle() {
								this.emitFile({
									type: 'asset',
									fileName: 'engine-lite-service-worker.js',
									source: fs.readFileSync(path.resolve(root, 'engine-lite-service-worker.js')),
								});
							},
						},
					],
					output: {
						inlineDynamicImports: true,
						manualChunks: undefined,
						entryFileNames: 'bundle.js',
						chunkFileNames: 'bundle.js',
						assetFileNames: '[name][extname]',
						format: 'iife',
					},
				},
			},
		},
	};

	if (!config[app]) throw new Error(`Unknown VITE_APP: ${app}`);

	return {
		root,
		base: './',
		plugins: [
			nodePolyfills({
				protocolImports: true,
			}),
			react(),
			...(app === 'viewer' ? [viteSingleFile()] : []),
		],
		resolve: {
			alias: {
				api: path.resolve(__dirname, 'src/api'),
				assets: path.resolve(__dirname, 'src/assets'),
				globalthis: path.resolve(__dirname, 'src/helpers/globalthis.ts'),
				editor: path.resolve(__dirname, 'src/apps/editor'),
				viewer: path.resolve(__dirname, 'src/apps/viewer'),
				engine: path.resolve(__dirname, 'src/apps/engine'),
				'engine-lite': path.resolve(__dirname, 'src/apps/engine-lite'),
				components: path.resolve(__dirname, 'src/components'),
				features: path.resolve(__dirname, 'src/features'),
				helpers: path.resolve(__dirname, 'src/helpers'),
				hooks: path.resolve(__dirname, 'src/hooks'),
				providers: path.resolve(__dirname, 'src/providers'),
				store: path.resolve(__dirname, 'src/store'),
				wallet: path.resolve(__dirname, 'src/wallet'),
				wrappers: path.resolve(__dirname, 'src/wrappers'),
				winston: path.resolve(__dirname, 'src/helpers/winston-shim.ts'),
				process: 'vite-plugin-node-polyfills/polyfills/process-es6',
				buffer: 'vite-plugin-node-polyfills/polyfills/buffer',
				crypto: 'vite-plugin-node-polyfills/polyfills/crypto',
				stream: 'vite-plugin-node-polyfills/polyfills/stream',
				util: 'vite-plugin-node-polyfills/polyfills/util',
				path: 'vite-plugin-node-polyfills/polyfills/path',
				events: 'vite-plugin-node-polyfills/polyfills/events',
				timers: 'vite-plugin-node-polyfills/polyfills/timers',
				http: 'vite-plugin-node-polyfills/polyfills/http',
				https: 'vite-plugin-node-polyfills/polyfills/https',
				os: 'vite-plugin-node-polyfills/polyfills/os',
				assert: 'vite-plugin-node-polyfills/polyfills/assert',
				zlib: 'vite-plugin-node-polyfills/polyfills/zlib',
				constants: 'vite-plugin-node-polyfills/polyfills/constants',
			},
		},
		optimizeDeps: {
			include: ['buffer', 'process', 'crypto', 'stream', 'util'],
			exclude: ['fix-esm', 'winston', '@dabh/diagnostics'],
		},
		build: config[app].build,
		server: {
			open: false,
			strictPort: true,
			hmr: true,
			port: config[app].port,
		},
	};
});
