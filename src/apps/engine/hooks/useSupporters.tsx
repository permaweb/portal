import React from 'react';

import Arweave from 'arweave';

import { SupporterTip } from 'helpers/types';

const arweave = Arweave.init({
	host: 'arweave.net',
	port: 443,
	protocol: 'https',
});

export function useSupporters(walletAddress: string | null, scope: 'global' | 'post', postId?: string) {
	const [supporters, setSupporters] = React.useState<SupporterTip[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!walletAddress) {
			setSupporters([]);
			setLoading(false);
			setError(null);
			return;
		}

		let cancelled = false;

		async function fetchSupporters() {
			try {
				setLoading(true);
				setError(null);

				// Build GraphQL query
				const query = {
					query: `
						query($toAddr: [String!]!) {
							transactions(
								tags: [
									{ name: "App-Name", values: ["Portal"] },
									{ name: "Type", values: ["Tip"] },
									{ name: "To-Address", values: $toAddr }
								],
								sort: HEIGHT_DESC,
								first: 100
							) {
								edges {
									node {
										id
										quantity { winston }
										block { timestamp }
										owner { address }
										tags { name value }
									}
								}
							}
						}
					`,
					variables: {
						toAddr: [walletAddress],
					},
				};

				const res = await fetch('https://arweave.net/graphql', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(query),
				});

				if (!res.ok) throw new Error(`GraphQL error: ${res.status}`);

				const json = await res.json();
				const edges = json?.data?.transactions?.edges || [];

				// Parse tips
				const parsed: SupporterTip[] = edges.map((edge: any) => {
					const node = edge.node;
					const tags: { name: string; value: string }[] = node.tags || [];

					const getTag = (name: string) => tags.find((t) => t.name === name)?.value || undefined;

					const winston = node.quantity?.winston || '0';
					const amountAr = arweave.ar.winstonToAr(winston);
					const location = getTag('Location');
					const locationPostId = getTag('Location-Post-Id');
					const usdValue = getTag('USD-Value') || null;

					return {
						id: node.id,
						timestamp: node.block?.timestamp ?? null,
						winston,
						amountAr,
						usdValue,
						fromAddress: getTag('From-Address') || node.owner?.address || '',
						fromProfile: getTag('From-Profile'),
						location,
						locationPostId,
					};
				});

				// Filter by scope if needed
				let filteredTips = parsed;
				if (scope === 'post' && postId) {
					// For post scope, only include tips tagged with this specific postId
					filteredTips = parsed.filter((tip) => tip.locationPostId === postId);
				} else if (scope === 'global') {
					// For global scope, include all tips
					filteredTips = parsed;
				}

				// Aggregate tips by supporter
				const supporterMap = new Map<string, SupporterTip>();

				filteredTips.forEach((tip) => {
					const key = tip.fromProfile || tip.fromAddress;
					const existing = supporterMap.get(key);

					if (existing) {
						// Aggregate amounts
						const existingWinston = BigInt(existing.winston);
						const tipWinston = BigInt(tip.winston);
						const totalWinston = existingWinston + tipWinston;

						existing.winston = totalWinston.toString();
						existing.amountAr = arweave.ar.winstonToAr(existing.winston);

						// Aggregate USD value if present
						if (tip.usdValue) {
							const existingUsd = Number(existing.usdValue || 0);
							const tipUsd = Number(tip.usdValue);
							const totalUsd = existingUsd + (Number.isFinite(tipUsd) ? tipUsd : 0);
							existing.usdValue = totalUsd > 0 ? totalUsd.toFixed(2) : existing.usdValue;
						}

						// Keep most recent timestamp
						if (tip.timestamp && (!existing.timestamp || tip.timestamp > existing.timestamp)) {
							existing.timestamp = tip.timestamp;
						}
					} else {
						supporterMap.set(key, { ...tip });
					}
				});

				const aggregatedSupporters = Array.from(supporterMap.values());

				if (!cancelled) {
					setSupporters(aggregatedSupporters);
					setLoading(false);
				}
			} catch (e: any) {
				console.error('Failed to fetch supporters:', e);
				if (!cancelled) {
					setError(e.message || 'Failed to fetch supporters');
					setLoading(false);
				}
			}
		}

		fetchSupporters();

		return () => {
			cancelled = true;
		};
	}, [walletAddress, scope, postId]);

	return { supporters, loading, error };
}
