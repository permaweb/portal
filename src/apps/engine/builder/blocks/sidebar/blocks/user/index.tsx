import React from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from 'engine/hooks/profiles';

import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress } from 'helpers/utils';

import SidebarArchive from '../archive';

import * as S from './styles';

export default function SidebarUser() {
	const params = useParams();
	const { profile } = useProfile(params?.user);

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

	return (
		<S.SidebarUserWrapper>
			<S.Header>
				<S.Banner>
					{profile.banner && (
						<img src={checkValidAddress(profile.banner) ? getTxEndpoint(profile.banner) : profile.banner} />
					)}
				</S.Banner>
				<S.Avatar>
					{profile.thumbnail && (
						<img src={checkValidAddress(profile.thumbnail) ? getTxEndpoint(profile.thumbnail) : profile.thumbnail} />
					)}
				</S.Avatar>
				<S.Name>{profile.displayName}</S.Name>
			</S.Header>
			<S.Content>
				<S.Bio>{profile.description}</S.Bio>
			</S.Content>
			<SidebarArchive author={profile.id} />
		</S.SidebarUserWrapper>
	);
}
