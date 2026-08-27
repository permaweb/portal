/// <reference types="vite/client" />

import type { BrowserWallet } from 'api/wallet';

import 'styled-components';

interface ImportMetaEnv {
	readonly VITE_APP: string;
	readonly VITE_ARIO_TESTNET?: string;
	readonly VITE_PORTAL_MODE?: 'base' | 'process';
	readonly VITE_ENABLE_AO?: string;
	readonly VITE_ENABLE_DOMAINS?: string;
	readonly VITE_ENABLE_PAYMENTS?: string;
	readonly VITE_ENABLE_UPLOADS?: string;
	readonly VITE_ENABLE_WANDER_AUTH?: string;
	readonly VITE_PERMAWEBOS_WALLET_URL?: string;
}

declare module 'styled-components' {
	export interface DefaultTheme {
		scheme: 'dark' | 'light';
		colors: any;
		typography: any;
	}
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module '*.png' {
	const value: string;
	export default value;
}

declare module '*.jpg' {
	const value: string;
	export default value;
}

declare module '*.jpeg' {
	const value: string;
	export default value;
}

declare module '*.gif' {
	const value: string;
	export default value;
}

declare module '*.svg' {
	import React from 'react';
	export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
	const src: string;
	export default src;
}

declare global {
	interface Window {
		arweaveWallet: any;
		permawebConnect?: BrowserWallet;
		wanderInstance: any;
	}
}

export {};
