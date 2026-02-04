import React from 'react';

import { SupporterColumnConfig, SupporterTip } from 'helpers/types';

import * as S from './styles';

type SupporterItemProps = {
	supporter: SupporterTip;
	columns: SupporterColumnConfig;
	amountDecimals: number;
};

function formatTimeAgo(timestamp: number | null): string {
	if (!timestamp) return '';

	const now = Date.now() / 1000; // Current time in seconds
	const diff = now - timestamp;

	if (diff < 60) return 'Just now';
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
	return `${Math.floor(diff / 2592000)}mo ago`;
}

function truncateAddress(address: string): string {
	if (address.length <= 12) return address;
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function SupporterItem(props: SupporterItemProps) {
	const { supporter, columns, amountDecimals } = props;

	const displayName = supporter.fromName || truncateAddress(supporter.fromAddress);
	const initials = supporter.fromName
		? supporter.fromName
				.split(' ')
				.map((n) => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2)
		: supporter.fromAddress.slice(0, 2).toUpperCase();

	return (
		<S.SupporterItem>
			{columns.avatar && (
				<S.AvatarWrapper>
					{supporter.fromAvatar ? (
						<S.Avatar src={supporter.fromAvatar} alt={displayName} />
					) : (
						<S.AvatarPlaceholder>{initials}</S.AvatarPlaceholder>
					)}
				</S.AvatarWrapper>
			)}

			{columns.name && (
				<S.SupporterInfo>
					<S.SupporterName>{displayName}</S.SupporterName>
					{!supporter.fromName && <S.SupporterAddress>{truncateAddress(supporter.fromAddress)}</S.SupporterAddress>}
				</S.SupporterInfo>
			)}

			{columns.value && (
				<S.SupporterAmount>
					{supporter.usdValue ? (
						<S.AmountPrimary>${supporter.usdValue} USD</S.AmountPrimary>
					) : (
						<S.AmountPrimary>{parseFloat(supporter.amountAr).toFixed(amountDecimals)} AR</S.AmountPrimary>
					)}
				</S.SupporterAmount>
			)}

			{columns.time && supporter.timestamp && <S.SupporterTime>{formatTimeAgo(supporter.timestamp)}</S.SupporterTime>}
		</S.SupporterItem>
	);
}
