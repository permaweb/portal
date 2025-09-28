import Arweave from 'arweave';
import { ARIOToken, mARIOToken } from '@ar.io/sdk';

import { STORAGE, URLS } from './config';
import { PortalAssetType, PortalDomainType, PortalUserType } from './types';

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

export function getByteSizeDisplay(bytes: number) {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0) return '0 Bytes';
	const i = Math.floor(Math.log(bytes) / Math.log(1000));
	return bytes / Math.pow(1000, i) + ' ' + sizes[i];
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
			'(\\#[-a-zA-Z\\d%_.~+=/?@:&]*)?$', // Optional fragment
		'i'
	);
	return urlPattern.test(url);
}

export function areAssetsEqual(assets1: PortalAssetType[], assets2: PortalAssetType[]): boolean {
	if (assets1?.length !== assets2?.length) {
		return false;
	}

	const sortedAssets1 = [...assets1].sort(
		(a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
	);
	const sortedAssets2 = [...assets2].sort(
		(a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
	);

	for (let i = 0; i < sortedAssets1?.length; i++) {
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

export function formatTurboAmount(amount: number) {
	return `${amount.toFixed(4)} Credits`;
}

export function formatUSDAmount(amount: number) {
	return `$ ${!amount || isNaN(amount) ? 0 : Number(amount).toFixed(2)}`;
}

export function getARAmountFromWinc(amount: number) {
	const arweave = Arweave.init({});
	return (Math.floor(+arweave.ar.winstonToAr(amount.toString()) * 1e6) / 1e6).toFixed(4);
}

// Preferred: use SDK conversion classes; fallback to denom 6
export function toReadableARIO(amountInMARIO: number): string {
	try {
		const token: unknown = new mARIOToken(amountInMARIO);
		// Some SDK builds type this loosely; cast defensively
		const arioVal = (token as { toARIO: () => number | string }).toARIO();
		return Number(arioVal).toFixed(4);
	} catch {
		return (Math.floor((amountInMARIO / 1e6) * 1e4) / 1e4).toFixed(4);
	}
}

export function toMARIOFromARIO(amountInARIO: number): number {
	try {
		const ar = new ARIOToken(amountInARIO);
		// Defensive cast for differing SDK typings
		return (ar as unknown as { toMARIO: () => number }).toMARIO();
	} catch {
		return Math.round(amountInARIO * 1e6);
	}
}

export function formatRoleLabel(role: string) {
	return role.replace(/[_-]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function filterDuplicates(arr: string[]): string[] {
	return arr.filter((item, idx, self) => self.indexOf(item) === idx);
}

export const getCachedPortal = (id: string) => {
	const cached = localStorage.getItem(STORAGE.portal(id));
	return cached ? JSON.parse(cached) : null;
};

export const cachePortal = (id: string, portalData: any) => {
	localStorage.setItem(STORAGE.portal(id), JSON.stringify(portalData));
};

export function getPortalAssets(index: PortalAssetType[]) {
	return index?.filter(
		(asset: any) =>
			asset.processType && asset.processType === 'atomic-asset' && asset.assetType && asset.assetType === 'blog-post'
	);
}

export function getPortalUsers(roles: any) {
	const users: PortalUserType[] = [];
	if (roles) {
		for (const entry of Object.keys(roles)) {
			users.push({
				address: entry,
				type: roles[entry].type,
				roles: roles[entry].roles,
			});
		}
	}
	return users;
}

export function stripFontWeights(fontString: string) {
	return fontString.split(':')[0];
}

export function urlify(str: string) {
	return str.toLowerCase().split(' ').join('-');
}

export function displayUrlName(str: string) {
	return str
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function getPortalIdFromURL(): string | null {
	const { pathname, hash } = window.location;

	const pathPart = pathname.split('/').filter(Boolean)[0];
	if (pathPart && checkValidAddress(pathPart)) {
		return pathPart;
	}

	const rawHash = hash.replace(/^#\/?/, '');
	const firstHashSegment = rawHash.split('/')[0];
	if (firstHashSegment && checkValidAddress(firstHashSegment)) {
		return firstHashSegment;
	}

	return null;
}

export function getRedirect(path?: string): string {
	const portalId = getPortalIdFromURL();
	if (portalId) return `${URLS.portalBase(portalId)}${path ?? ''}`;
	return `${URLS.base}${path ?? ''}`;
}

export function getCachedProfile(address: string) {
	const cached = localStorage.getItem(STORAGE.profile(address));
	return cached ? JSON.parse(cached) : null;
}

export function cacheProfile(address: string, profileData: any) {
	localStorage.setItem(STORAGE.profile(address), JSON.stringify(profileData));
}

export function stripAnsiChars(input: string) {
	if (!input) return null;
	const ansiRegex = /\x1B\[[0-9;]*m/g;
	return input.toString().replace(ansiRegex, '');
}

function getCurrentGateway() {
	const { host } = window.location;
	const parts = host.split('.');
	return `${parts[1]}.${parts[2]}`;
}

export function resolvePrimaryDomain(domains: PortalDomainType[], portalId: string) {
	const gateway = window.location.hostname === 'localhost' ? 'arweave.net' : getCurrentGateway();
	const domain = domains?.find((domain) => domain.primary)?.name || domains?.[0]?.name;
	if (domain) return `https://${domain}.${gateway}`;
	else return `https://${gateway}/${portalId}`;
}
