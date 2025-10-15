import { ReactSVG } from 'react-svg';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS_SOCIAL } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';

import * as S from './styles';

function getSocialIcon(url: string, icon: string): string | null {
	const lowerUrl = url.toLowerCase();
	if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return ICONS_SOCIAL.X;
	if (lowerUrl.includes('github.com')) return ICONS_SOCIAL.GITHUB;
	if (lowerUrl.includes('discord.com') || lowerUrl.includes('discord.gg')) return ICONS_SOCIAL.DISCORD;
	if (lowerUrl.includes('telegram.org') || lowerUrl.includes('t.me')) return ICONS_SOCIAL.TELEGRAM;
	if (lowerUrl.includes('facebook.com')) return ICONS_SOCIAL.FACEBOOK;
	if (lowerUrl.includes('instagram.com')) return ICONS_SOCIAL.INSTAGRAM;
	if (lowerUrl.includes('linkedin.com')) return ICONS_SOCIAL.LINKEDIN;
	if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return ICONS_SOCIAL.YOUTUBE;
	if (lowerUrl.includes('reddit.com')) return ICONS_SOCIAL.REDDIT;
	if (lowerUrl.includes('tiktok.com')) return ICONS_SOCIAL.TIKTOK;
	if (lowerUrl.includes('spotify.com')) return ICONS_SOCIAL.SPOTIFY;
	if (lowerUrl.includes('mastodon')) return ICONS_SOCIAL.MASTODON;
	if (lowerUrl.includes('patreon.com')) return ICONS_SOCIAL.PATREON;
	if (lowerUrl.includes('rumble.com')) return ICONS_SOCIAL.RUMBLE;
	if (lowerUrl.includes('odysee.com')) return ICONS_SOCIAL.ODYSEE;
	if (lowerUrl.includes('dailymotion.com')) return ICONS_SOCIAL.DAILYMOTION;
	if (lowerUrl.includes('apple.com')) return ICONS_SOCIAL.APPLE;
	if (lowerUrl.includes('vk.com')) return ICONS_SOCIAL.VK;
	if (lowerUrl.includes('wechat.com')) return ICONS_SOCIAL.WECHAT;
	if (lowerUrl.includes('whatsapp.com')) return ICONS_SOCIAL.WHATSAPP;
	return icon || null;
}

interface SocialLinksProps {
	isFooter?: boolean;
}

export default function SocialLinks({ isFooter = false }: SocialLinksProps) {
	const { portal } = usePortalProvider();
	const Links = portal?.Links;

	if (!Links || Links.length === 0) return null;

	return (
		<S.Links $isFooter={isFooter}>
			<S.LinksList $isFooter={isFooter}>
				{Links.map((link: any, index: number) => {
					const icon = getSocialIcon(link.url, link.icon);
					return (
						<a key={index} href={link.url} target="_blank" rel="noreferrer" title={link.title}>
							<ReactSVG src={getTxEndpoint(icon ?? ICONS_SOCIAL.DEFAULT_ICON)} />
						</a>
					);
				})}
			</S.LinksList>
		</S.Links>
	);
}
