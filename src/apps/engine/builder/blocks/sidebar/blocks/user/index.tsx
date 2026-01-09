import React from 'react';
import { useParams } from 'react-router-dom';
import Avatar from 'engine/components/avatar';
import { useProfile } from 'engine/hooks/profiles';

import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress, debugLog } from 'helpers/utils';

import * as S from './styles';

type UserTip = {
	id: string;
	amountAr: string;
	toAddress: string;
	toName?: string;
	timestamp?: string;
};

function shortenAddress(addr: string | undefined | null) {
	if (!addr) return '';
	if (addr.length <= 12) return addr;
	return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function SidebarUser() {
	const params = useParams();
	const { profile } = useProfile(params?.user);

	const [tips, setTips] = React.useState<UserTip[] | null>(null);
	const [tipsLoading, setTipsLoading] = React.useState(false);

	React.useEffect(() => {
		if (!profile?.displayName && !profile?.displayname) return;

		const name = profile.displayName || profile.displayname;
		const title = `Posts by ${name}`;
		const image = profile.thumbnail
			? checkValidAddress(profile.thumbnail)
				? getTxEndpoint(profile.thumbnail)
				: profile.thumbnail
			: undefined;
		const url = window.location.href;

		// set page title
		document.title = title;

		const created: HTMLMetaElement[] = [];

		const ensureMeta = (attr: string, key: string, value: string) => {
			let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
			if (!tag) {
				tag = document.createElement('meta');
				tag.setAttribute(attr, key);
				document.head.appendChild(tag);
				created.push(tag);
			}
			tag.setAttribute('content', value);
		};

		ensureMeta('property', 'og:title', title);
		ensureMeta('property', 'og:description', `Explore posts created by ${name}.`);
		if (image) ensureMeta('property', 'og:image', image);
		ensureMeta('property', 'og:url', url);

		ensureMeta('name', 'twitter:title', title);
		ensureMeta('name', 'twitter:description', `Explore posts created by ${name}.`);
		if (image) ensureMeta('name', 'twitter:image', image);
		ensureMeta('name', 'twitter:url', url);

		return () => {
			created.forEach((tag) => tag.remove());
		};
	}, [profile]);

	// --- Tip history (tips GIVEN by this user, via From-Profile tag) ---
	React.useEffect(() => {
		const username = profile?.username;
		if (!username) {
			setTips(null);
			return;
		}

		let cancelled = false;

		async function loadTips() {
			try {
				setTipsLoading(true);

				const query = `
					query($fromProfile: [String!]!) {
					  transactions(
					    first:100
					    sort: HEIGHT_DESC
					    tags: [
					      { name: "App-Name", values: ["Portal"] }
					      { name: "Type", values: ["Tip"] }
					      { name: "From-Profile", values: $fromProfile }
					    ]
					  ) {
					    edges {
					      node {
					        id
					        block {
					          timestamp
					        }
					        tags {
					          name
					          value
					        }
					      }
					    }
					  }
					}
				`;
				const res = await fetch('https://arweave.net/graphql', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						query,
						variables: { fromProfile: [String(profile.id)] },
					}),
				});

				if (!res.ok) throw new Error('Failed to load tip history');

				const json = await res.json();
				debugLog('info', 'SidebarUser', 'Tip history response:', json);
				const edges: any[] = json?.data?.transactions?.edges ?? [];
				const next: UserTip[] = edges.map((edge) => {
					const node = edge.node;
					const tags: { name: string; value: string }[] = node.tags || [];

					const getTag = (name: string) => tags.find((t) => t.name === name)?.value;

					const amountWinston = getTag('Amount');
					const toAddress = getTag('To-Address') || node.target || '';
					const portalName = getTag('Portal-Name');
					const ts = node.block?.timestamp ? new Date(node.block.timestamp * 1000).toISOString() : undefined;

					let amountAr = '0';
					if (amountWinston && !Number.isNaN(Number(amountWinston))) {
						amountAr = (Number(amountWinston) / 1e12).toFixed(3);
					}

					return {
						id: node.id,
						amountAr,
						toAddress,
						toName: portalName || undefined,
						timestamp: ts,
					};
				});

				if (!cancelled) {
					setTips(next);
				}
			} catch (e) {
				debugLog('error', 'SidebarUser', 'Failed to load tip history', e);
				if (!cancelled) {
					setTips([]);
				}
			} finally {
				if (!cancelled) {
					setTipsLoading(false);
				}
			}
		}

		loadTips();

		return () => {
			cancelled = true;
		};
	}, [profile?.username]);

	const hasTips = !!tips && tips.length > 0;

	return (
		<S.SidebarUserWrapper>
			<S.Header>
				<S.Banner>
					{profile.banner && checkValidAddress(profile.banner) && (
						<img
							src={getTxEndpoint(profile.banner)}
							onError={(e) => {
								e.currentTarget.style.display = 'none';
							}}
						/>
					)}
				</S.Banner>
				<S.Avatar>
					<Avatar profile={profile} size={52} />
				</S.Avatar>
				<S.Name>{profile.displayName}</S.Name>
			</S.Header>

			<S.Content>
				<S.Bio>{profile.description}</S.Bio>

				{tipsLoading && !hasTips && <S.TipsPlaceholder>Loading tip activity…</S.TipsPlaceholder>}

				{hasTips && (
					<S.TipsSection>
						<S.TipsHeader>Tip activity</S.TipsHeader>
						<S.TipsList>
							{tips!.map((tip) => (
								<S.TipRow key={tip.id}>
									<div>
										<span className="tip-amount">{tip.amountAr} AR</span>
										{tip.toName ? (
											<span className="tip-target">to {tip.toName}</span>
										) : (
											<span className="tip-target">to {shortenAddress(tip.toAddress)}</span>
										)}
										{tip.timestamp && <span className="tip-date">{new Date(tip.timestamp).toLocaleDateString()}</span>}
									</div>
								</S.TipRow>
							))}
						</S.TipsList>
					</S.TipsSection>
				)}
			</S.Content>
		</S.SidebarUserWrapper>
	);
}
