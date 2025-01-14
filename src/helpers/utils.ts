import { PortalAssetType } from './types';

export function checkValidAddress(address: string | null) {
	if (!address) return false;
	return /^[a-z0-9_-]{43}$/i.test(address);
}

export function formatAddress(address: string | null, wrap: boolean) {
	if (!address) return '';
	if (!checkValidAddress(address)) return address;
	const formattedAddress = address.substring(0, 5) + '...' + address.substring(36, address.length);
	return wrap ? `(${formattedAddress})` : formattedAddress;
}

export function getTagValue(list: { [key: string]: any }[], name: string): string {
	for (let i = 0; i < list.length; i++) {
		if (list[i]) {
			if (list[i]!.name === name) {
				return list[i]!.value as string;
			}
		}
	}
	return null;
}

export function formatCount(count: string): string {
	if (count === '0' || !Number(count)) return '0';

	if (count.includes('.')) {
		let parts = count.split('.');
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

		// Find the position of the last non-zero digit within the first 6 decimal places
		let index = 0;
		for (let i = 0; i < Math.min(parts[1].length, 6); i++) {
			if (parts[1][i] !== '0') {
				index = i + 1;
			}
		}

		if (index === 0) {
			// If all decimals are zeros, keep two decimal places
			parts[1] = '00';
		} else {
			// Otherwise, truncate to the last non-zero digit
			parts[1] = parts[1].substring(0, index);

			// If the decimal part is longer than 2 digits, truncate to 2 digits
			if (parts[1].length > 2 && parts[1].substring(0, 2) !== '00') {
				parts[1] = parts[1].substring(0, 2);
			}
		}

		return parts.join('.');
	} else {
		return count.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}
}

export function formatDate(dateArg: string | number | null, dateType: 'iso' | 'epoch', fullTime?: boolean) {
	if (!dateArg) {
		return null;
	}

	let date: Date | null = null;

	switch (dateType) {
		case 'iso':
			date = new Date(dateArg);
			break;
		case 'epoch':
			date = new Date(Number(dateArg));
			break;
		default:
			date = new Date(dateArg);
			break;
	}

	return fullTime
		? `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getUTCFullYear()} at ${
				date.getHours() % 12 || 12
		  }:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`
		: `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getUTCFullYear()}`;
}

export function getRelativeDate(timestamp: number) {
	if (!timestamp) return '-';
	const currentDate = new Date();
	const inputDate = new Date(timestamp);

	const timeDifference: number = currentDate.getTime() - inputDate.getTime();
	const secondsDifference = Math.floor(timeDifference / 1000);
	const minutesDifference = Math.floor(secondsDifference / 60);
	const hoursDifference = Math.floor(minutesDifference / 60);
	const daysDifference = Math.floor(hoursDifference / 24);
	const monthsDifference = Math.floor(daysDifference / 30.44); // Average days in a month
	const yearsDifference = Math.floor(monthsDifference / 12);

	if (yearsDifference > 0) {
		return `${yearsDifference} year${yearsDifference > 1 ? 's' : ''} ago`;
	} else if (monthsDifference > 0) {
		return `${monthsDifference} month${monthsDifference > 1 ? 's' : ''} ago`;
	} else if (daysDifference > 0) {
		return `${daysDifference} day${daysDifference > 1 ? 's' : ''} ago`;
	} else if (hoursDifference > 0) {
		return `${hoursDifference} hour${hoursDifference > 1 ? 's' : ''} ago`;
	} else if (minutesDifference > 0) {
		return `${minutesDifference} minute${minutesDifference > 1 ? 's' : ''} ago`;
	} else {
		return `${secondsDifference} second${secondsDifference !== 1 ? 's' : ''} ago`;
	}
}

export function formatPercentage(percentage: any) {
	let multiplied = percentage * 100;
	let decimalPart = multiplied.toString().split('.')[1];

	if (!decimalPart) {
		return `${multiplied.toFixed(0)}%`;
	}

	if (decimalPart.length > 6 && decimalPart.substring(0, 6) === '000000') {
		return `${multiplied.toFixed(0)}%`;
	}

	let nonZeroIndex = decimalPart.length;
	for (let i = 0; i < decimalPart.length; i++) {
		if (decimalPart[i] !== '0') {
			nonZeroIndex = i + 1;
			break;
		}
	}

	return `${multiplied.toFixed(nonZeroIndex)}%`;
}

export function formatRequiredField(field: string) {
	return `${field} *`;
}

export function splitTagValue(tag) {
	let parts = tag.split('-');

	let lastPart = parts[parts.length - 1];
	if (!isNaN(lastPart)) {
		parts = parts.slice(0, -1).join(' ') + ': ' + lastPart;
	} else {
		parts = parts.join(' ');
	}

	return parts;
}

export function getTagDisplay(value: string) {
	let result = value.replace(/([A-Z])/g, ' $1').trim();
	result = result.charAt(0).toUpperCase() + result.slice(1);
	return result;
}

export function getDataURLContentType(dataURL: string) {
	const result = dataURL.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
	return result ? result[1] : null;
}

export function getBase64Data(dataURL: string) {
	return dataURL.split(',')[1];
}

export function getByteSize(input: string | Buffer): number {
	let sizeInBytes: number;
	if (Buffer.isBuffer(input)) {
		sizeInBytes = input.length;
	} else if (typeof input === 'string') {
		sizeInBytes = Buffer.byteLength(input, 'utf-8');
	} else {
		throw new Error('Input must be a string or a Buffer');
	}

	return sizeInBytes;
}

export function isMac(): boolean {
	return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export function validateUrl(url: string) {
	const urlPattern = new RegExp(
		'^(https?:\\/\\/)?' + // Optional protocol
			'((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' + // Domain name
			'localhost|' + // OR localhost
			'\\d{1,3}(\\.\\d{1,3}){3})' + // OR IPv4
			'(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + // Optional port and path
			'(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // Optional query
			'(\\#[-a-zA-Z\\d_]*)?$', // Optional fragment
		'i'
	);
	return urlPattern.test(url);
}

export function areAssetsEqual(assets1: PortalAssetType[], assets2: PortalAssetType[]): boolean {
	if (assets1.length !== assets2.length) {
		return false;
	}

	const sortedAssets1 = [...assets1].sort(
		(a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
	);
	const sortedAssets2 = [...assets2].sort(
		(a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
	);

	for (let i = 0; i < sortedAssets1.length; i++) {
		if (!isEqual(sortedAssets1[i], sortedAssets2[i])) {
			return false;
		}
	}

	return true;
}

export function isEqual(obj1: any, obj2: any): boolean {
	if (typeof obj1 !== typeof obj2) return false;

	if (typeof obj1 === 'object' && obj1 !== null && obj2 !== null) {
		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);

		if (keys1.length !== keys2.length) return false;

		for (const key of keys1) {
			if (!isEqual(obj1[key], obj2[key])) return false;
		}

		return true;
	}

	return obj1 === obj2;
}

export function getBootTag(key: string, value: string) {
	return { name: `Bootloader-${key}`, value };
}
