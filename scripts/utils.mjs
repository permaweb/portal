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

export function checkValidAddress(address) {
	return typeof address === 'string' && /^[a-zA-Z0-9_-]{43}$/.test(address);
}

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

export async function withRetries(fn, options = {}) {
	const { maxRetries = 3, delayMs = 1000, backoff = true, validate } = options;

	let lastError;
	let lastResult;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const result = await fn();

			if (!validate || validate(result)) {
				if (attempt > 0) {
					debugLog('success', 'withRetries', `Success on attempt ${attempt + 1}`);
				}
				return result;
			}

			lastResult = result;
			if (attempt < maxRetries - 1) {
				const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
				debugLog(
					'warn',
					'withRetries',
					`Validation failed on attempt ${attempt + 1}/${maxRetries}, retrying in ${delay}ms...`
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		} catch (error) {
			lastError = error;
			if (attempt < maxRetries - 1) {
				const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
				debugLog(
					'warn',
					'withRetries',
					`Error on attempt ${attempt + 1}/${maxRetries}: ${error.message}, retrying in ${delay}ms...`
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	if (lastError) {
		debugLog('error', 'withRetries', `Failed after ${maxRetries} attempts: ${lastError.message}`);
		throw lastError;
	}

	debugLog('warn', 'withRetries', `Validation failed after ${maxRetries} attempts`);
	return lastResult;
}

export async function fetchZoneData(portalId, sourceNode) {
	try {
		const url = `${sourceNode}/${portalId}~process@1.0/compute?require-codec=application/json&accept-bundle=true`;
		debugLog('info', 'fetchZoneData', `Fetching data for ${portalId}...`);

		const response = await fetch(url);

		if (!response.ok) {
			debugLog('warn', 'fetchZoneData', `Failed to fetch portal ${portalId}: HTTP ${response.status}`);
			return null;
		}

		const data = await response.json();
		debugLog('success', 'fetchZoneData', `Successfully fetched ${portalId}`);
		return data;
	} catch (error) {
		debugLog('error', 'fetchZoneData', `Error fetching portal ${portalId}:`, error.message);
		return null;
	}
}

export function getBootTag(key, value) {
	return { name: `Bootloader-${key}`, value };
}

export function getPatchMapTag(key, values) {
	const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
	return {
		name: `Zone-Patch-Map-${capitalizedKey}`,
		value: JSON.stringify(values),
	};
}
