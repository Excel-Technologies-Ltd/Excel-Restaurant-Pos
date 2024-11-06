import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import proxyOptions from './proxyOptions';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	return {
		plugins: [
			react(),
			svgr(),
			VitePWA({
				registerType: 'autoUpdate',
				strategies: 'generateSW',
				injectRegister: null,
				manifest: {
					name: 'POS Restaurant',
					short_name: 'POS Restaurant',
					description: 'POS Restaurant',
					start_url: `/restaurant`,
					display: 'standalone',
					background_color: '#ffffff',
					theme_color: '#ffffff',
					icons: [
						{
							"src": "/assets/portal/manifest/android-chrome-192x192.png",
							"sizes": "192x192",
							"type": "image/png"
						},
						{
							"src": "/assets/portal/manifest/android-chrome-512x512.png",
							"sizes": "512x512",
							"type": "image/png"
						},
						{
							"src": "/assets/portal/manifest/apple-touch-icon.png",
							"sizes": "180x180",
							"type": "image/png"
						},
						{
							"src": "/assets/portal/manifest/favicon-16x16.png",
							"sizes": "16x16",
							"type": "image/png"
						},
						{
							"src": "/assets/portal/manifest/favicon-32x32.png",
							"sizes": "32x32",
							"type": "image/png"
						},
						{
							"src": "/assets/portal/manifest/favicon.ico",
							"sizes": "64x64 32x32 24x24 16x16",
							"type": "image/x-icon"
						}
					],
				},
				workbox: {
					// Workbox options
					// You can customize cache strategies here if needed
				},
			}),
		],
		server: {
			port: 8080,
			proxy: proxyOptions,
		},
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
		build: {
			outDir: '../excel_restaurant_pos/public/portal',
			emptyOutDir: true,
			target: 'es2015',
			rollupOptions: {
				onwarn(warning, warn) {
					if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
						return;
					}
					warn(warning);
				},
			},
		},
	};
});
