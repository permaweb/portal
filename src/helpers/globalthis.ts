type GlobalThisModule = (() => typeof globalThis) & {
	getPolyfill: () => typeof globalThis;
	implementation: () => typeof globalThis;
	shim: () => typeof globalThis;
};

export function getPolyfill(): typeof globalThis {
	if (typeof globalThis !== 'undefined') return globalThis;
	if (typeof self !== 'undefined') return self as typeof globalThis;
	if (typeof window !== 'undefined') return window as typeof globalThis;

	throw new Error('Unable to resolve the global object');
}

const getGlobalThis = (() => getPolyfill()) as GlobalThisModule;

getGlobalThis.getPolyfill = getPolyfill;
getGlobalThis.implementation = getPolyfill;
getGlobalThis.shim = getPolyfill;

export default getGlobalThis;
