import React from 'react';

const STORAGE_KEY = 'permaweb-widget-groups';

interface GroupInfo {
	name: string;
	groupHash: string;
}

async function deriveKey(name: string, secret: string): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const material = encoder.encode(name + secret);
	const hashBuffer = await crypto.subtle.digest('SHA-256', material);
	return crypto.subtle.importKey('raw', hashBuffer, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function hashGroup(name: string, secret: string): Promise<string> {
	const encoder = new TextEncoder();
	const material = encoder.encode(name + secret);
	const hashBuffer = await crypto.subtle.digest('SHA-256', material);
	return Array.from(new Uint8Array(hashBuffer))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
	}
	return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export const useEncryption = () => {
	const [key, setKey] = React.useState<CryptoKey | null>(null);
	const [activeGroup, setActiveGroup] = React.useState<GroupInfo | null>(null);
	const [groups, setGroups] = React.useState<GroupInfo[]>([]);

	// Load groups from localStorage
	React.useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				setGroups(JSON.parse(stored));
			}
		} catch (e) {
			console.error('Error loading groups:', e);
		}
	}, []);

	const joinGroup = React.useCallback(async (name: string, secret: string) => {
		const derivedKey = await deriveKey(name, secret);
		const gh = await hashGroup(name, secret);

		const groupInfo: GroupInfo = { name, groupHash: gh };

		setKey(derivedKey);
		setActiveGroup(groupInfo);

		setGroups((prev) => {
			const exists = prev.some((g) => g.groupHash === gh);
			if (exists) return prev;
			const updated = [...prev, groupInfo];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
			return updated;
		});

		return groupInfo;
	}, []);

	const selectGroup = React.useCallback(
		async (groupHash: string, secret: string) => {
			const group = groups.find((g) => g.groupHash === groupHash);
			if (!group) return;

			const derivedKey = await deriveKey(group.name, secret);
			setKey(derivedKey);
			setActiveGroup(group);
		},
		[groups]
	);

	const encryptMessage = React.useCallback(
		async (text: string): Promise<string> => {
			if (!key) throw new Error('No encryption key');

			const encoder = new TextEncoder();
			const iv = crypto.getRandomValues(new Uint8Array(12));
			const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(text));

			const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
			combined.set(iv);
			combined.set(new Uint8Array(encrypted), iv.length);

			return bytesToHex(combined);
		},
		[key]
	);

	const decryptMessage = React.useCallback(
		async (hex: string): Promise<string> => {
			if (!key) throw new Error('No encryption key');

			try {
				const combined = hexToBytes(hex);
				const iv = combined.slice(0, 12);
				const data = combined.slice(12);

				const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);

				return new TextDecoder().decode(decrypted);
			} catch (e) {
				return '[encrypted]';
			}
		},
		[key]
	);

	return {
		activeGroup,
		groups,
		joinGroup,
		selectGroup,
		encryptMessage,
		decryptMessage,
		hasKey: !!key,
	};
};
