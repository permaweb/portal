const COLORS = {
	info: '\x1b[90m',
	warn: '\x1b[33m',
	error: '\x1b[31m',
	success: '\x1b[32m',
	reset: '\x1b[0m',
};

const METHOD = {
	info: console.log,
	warn: console.log,
	error: console.log,
	success: console.log,
};

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function debugLog(level, context, ...args) {
	const color = COLORS[level] || COLORS.info;
	const method = METHOD[level] || console.log;

	const formattedArgs = args.map((arg) =>
		typeof arg === 'object' && arg !== null ? JSON.stringify(arg, null, 2) : arg
	);

	method(`${color}[${capitalize(level)}]${COLORS.reset} -`, ...formattedArgs);
}
