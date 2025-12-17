import { ReactSVG } from 'react-svg';
import { generateColorFromId, getContrastColor } from 'engine/helpers/themes';

import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress } from 'helpers/utils';

import * as S from './styles';

type AvatarProps = {
	src?: string;
	profile?: {
		thumbnail?: string;
		id?: string;
	};
	isLoading?: boolean;
	className?: string;
	onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
	size?: number;
	hoverable?: boolean;
};

export default function Avatar(props: AvatarProps) {
	const { src, profile, isLoading, className, onLoad, size = 46, hoverable = false } = props;

	const thumbnailSrc =
		src || (profile?.thumbnail && checkValidAddress(profile.thumbnail) ? getTxEndpoint(profile.thumbnail) : null);
	const bgColor = generateColorFromId(profile?.id);
	const iconColor = getContrastColor(bgColor);

	if (isLoading || (!thumbnailSrc && isLoading)) {
		return (
			<S.Avatar className={className} $size={size} $bgColor={bgColor} $iconColor={iconColor} $hoverable={hoverable}>
				<ReactSVG src={ICONS.user} />
			</S.Avatar>
		);
	}

	if (thumbnailSrc) {
		return (
			<S.Avatar
				className={className}
				$size={size}
				$bgColor={bgColor}
				$iconColor={iconColor}
				$hoverable={hoverable}
				$hasImage
			>
				<img
					className="loadingAvatar"
					onLoad={(e) => {
						e.currentTarget.classList.remove('loadingAvatar');
						onLoad?.(e);
					}}
					src={thumbnailSrc}
				/>
			</S.Avatar>
		);
	}

	return (
		<S.Avatar className={className} $size={size} $bgColor={bgColor} $iconColor={iconColor} $hoverable={hoverable}>
			<ReactSVG src={ICONS.user} />
		</S.Avatar>
	);
}
