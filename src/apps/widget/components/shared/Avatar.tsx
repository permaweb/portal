import React from 'react';
import styled from 'styled-components';

import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress } from 'helpers/utils';

const AvatarWrapper = styled.div<{ $size: number; $bgColor: string }>`
	flex-shrink: 0;
	width: ${(props) => props.$size}px;
	height: ${(props) => props.$size}px;
	background: ${(props) => props.$bgColor};
	border-radius: 50%;
	position: relative;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;

	img {
		width: ${(props) => props.$size}px;
		height: ${(props) => props.$size}px;
		border-radius: 50%;
		object-fit: cover;
	}

	span {
		color: white;
		font-weight: 600;
		font-size: ${(props) => props.$size * 0.4}px;
		text-transform: uppercase;
	}
`;

function generateColorFromId(id?: string): string {
	if (!id) return '#888';
	let hash = 0;
	for (let i = 0; i < id.length; i++) {
		hash = id.charCodeAt(i) + ((hash << 5) - hash);
	}
	const hue = Math.abs(hash % 360);
	return `hsl(${hue}, 65%, 55%)`;
}

type AvatarProps = {
	profile?: {
		thumbnail?: string;
		id?: string;
		displayName?: string;
	};
	isLoading?: boolean;
	size?: number;
};

export default function Avatar(props: AvatarProps) {
	const { profile, isLoading, size = 36 } = props;

	const thumbnailSrc =
		profile?.thumbnail && checkValidAddress(profile.thumbnail) ? getTxEndpoint(profile.thumbnail) : null;
	const bgColor = generateColorFromId(profile?.id);
	const initial = (profile?.displayName || profile?.id || '?').charAt(0);

	if (isLoading) {
		return (
			<AvatarWrapper $size={size} $bgColor="#555">
				<span>...</span>
			</AvatarWrapper>
		);
	}

	if (thumbnailSrc) {
		return (
			<AvatarWrapper $size={size} $bgColor={bgColor}>
				<img src={thumbnailSrc} alt="" />
			</AvatarWrapper>
		);
	}

	return (
		<AvatarWrapper $size={size} $bgColor={bgColor}>
			<span>{initial}</span>
		</AvatarWrapper>
	);
}
