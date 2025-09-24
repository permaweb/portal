import react from '@vitejs/plugin-react';
import path from 'path';
import polyfillNode from 'rollup-plugin-polyfill-node';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	const app = env.VITE_APP;

	if (!app) throw new Error(`VITE_APP must be set to 'editor' or 'viewer'.`);

	const root = path.resolve(__dirname, `src/apps/${app}`);

	const config: any = {
		editor: {
			port: 3000,
			build: {
				sourcemap: false,
				outDir: path.resolve(__dirname, `dist/${app}`),
				emptyOutDir: true,
				rollupOptions: {
					input: path.resolve(root, 'index.html'),
					plugins: [polyfillNode()],
					output: {
						manualChunks: (id: string) => {
							if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
								return 'vendor';
							}
							if (id.includes('@permaweb/aoconnect')) {
								return 'ao-connect';
							}
							if (id.includes('@permaweb/libs') || id.includes('arweave')) {
								return 'permaweb-libs';
							}
							if (id.includes('@stripe/')) {
								return 'stripe';
							}
							if (
								id.includes('html-react-parser') ||
								id.includes('react-markdown') ||
								id.includes('react-svg') ||
								id.includes('webfontloader')
							) {
								return 'utils';
							}

							return undefined;
						},
					},
				},
			},
		},
		engine: {
			port: 5000,
			build: {
				outDir: path.resolve(__dirname, `dist/${app}`),
				emptyOutDir: true,
				cssCodeSplit: false,
				assetsInlineLimit: 10_000_000,
				rollupOptions: {
					input: path.resolve(root, 'index.tsx'),
					plugins: [polyfillNode()],
					output: {
						inlineDynamicImports: true,
						manualChunks: undefined,
						entryFileNames: `bundle.js`,
						chunkFileNames: `bundle.js`,
						assetFileNames: `[name][extname]`,
						format: 'es',
					},
				},
			},
		},
	};

	return {
		root,
		base: './',
		plugins: [
			nodePolyfills({
				protocolImports: true,
			}),
			react(),
			...(app === 'viewer' ? [viteSingleFile()] : []),
			VitePWA({
				injectRegister: false,
				registerType: 'autoUpdate',
				disable: false,
				workbox: {
					globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
					maximumFileSizeToCacheInBytes: (app === 'editor' ? 10 : 24) * 1024 * 1024, // 10 MB for Editor / 24 for Engine
					clientsClaim: true,
					skipWaiting: true,
					cleanupOutdatedCaches: true,
					navigateFallbackDenylist: [/^\/assets\//, /^assets\//],
					ignoreURLParametersMatching: [/^v$/, /^ver$/, /^utm_/, /^cachebust$/],
					mode: 'production',
					sourcemap: false,
					runtimeCaching: [
						{
							urlPattern: /^https:\/\/portal\.[^\/]+\/(?:\?[^#]*)?(?:#.*)?$/i,
							handler: 'NetworkOnly',
							method: 'GET',
							options: { cacheName: 'portal-root-bypass' },
						},
						{
							urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
							handler: 'CacheFirst',
							options: {
								cacheName: 'google-fonts-cache',
								expiration: {
									maxEntries: 10,
									maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
								},
							},
						},
						{
							urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
							handler: 'CacheFirst',
							options: {
								cacheName: 'gstatic-fonts-cache',
								expiration: {
									maxEntries: 10,
									maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
								},
							},
						},
						{
							urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
							handler: 'CacheFirst',
							options: {
								cacheName: 'images-cache',
								expiration: {
									maxEntries: 100,
									maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
								},
							},
						},
					],
				},
				manifest: {
					name: 'Portal',
					short_name: 'Portal',
					description: 'Permaweb Portal Application',
					theme_color: '#ffffff',
					icons: [
						{
							src: 'icon-192x192.png',
							sizes: '192x192',
							type: 'image/png',
						},
						{
							src: 'icon-512x512.png',
							sizes: '512x512',
							type: 'image/png',
						},
					],
				},
			}),
		],
		resolve: {
			alias: {
				editor: path.resolve(__dirname, 'src/apps/editor'),
				viewer: path.resolve(__dirname, 'src/apps/viewer'),
				engine: path.resolve(__dirname, 'src/apps/engine'),
				components: path.resolve(__dirname, 'src/components'),
				helpers: path.resolve(__dirname, 'src/helpers'),
				hooks: path.resolve(__dirname, 'src/hooks'),
				providers: path.resolve(__dirname, 'src/providers'),
				store: path.resolve(__dirname, 'src/store'),
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
				https: 'vite-plugin-node-polyfills/polyfills/https',
				os: 'vite-plugin-node-polyfills/polyfills/os',
				assert: 'vite-plugin-node-polyfills/polyfills/assert',
				zlib: 'vite-plugin-node-polyfills/polyfills/zlib',
				constants: 'vite-plugin-node-polyfills/polyfills/constants',
			},
		},
		optimizeDeps: {
			include: ['buffer', 'process', 'crypto', 'stream', 'util'],
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
