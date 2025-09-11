/// <reference types="vite/client" />

import 'styled-components';

interface ImportMetaEnv {
	readonly VITE_APP: string;
	readonly VITE_ARIO_TESTNET?: string;
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
		wanderInstance: any;
	}
}

export {};
