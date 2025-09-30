// Browser-compatible shim for winston logger
// Used by @ardrive/turbo-sdk in browser environments

const noop = () => {};

const mockLogger = {
	error: noop,
	warn: noop,
	info: noop,
	http: noop,
	verbose: noop,
	debug: noop,
	silly: noop,
	log: noop,
	add: noop,
	remove: noop,
	clear: noop,
	close: noop,
	configure: noop,
};

export const createLogger = () => mockLogger;
export const format = {
	combine: () => ({}),
	timestamp: () => ({}),
	printf: () => ({}),
	colorize: () => ({}),
	simple: () => ({}),
	json: () => ({}),
};
export const transports = {
	Console: class {},
	File: class {},
};

export default {
	createLogger,
	format,
	transports,
};
