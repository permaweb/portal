import styled from 'styled-components';

export const SidebarUserWrapper = styled.div`
	max-width: 100%;
`;

export const Header = styled.div`
	position: relative;
`;

export const Banner = styled.div`
	height: 100px;
	overflow: hidden;
	img {
		width: 300px;
	}

	&::after {
		position: absolute;
		left: 0;
		bottom: 0;
		content: '';
		height: 100%;
		opacity: 1;
		width: 100%;
		background: linear-gradient(0deg, #0d0d0d, transparent 65%);
	}
`;

export const Avatar = styled.div`
	position: absolute;
	bottom: -12px;
	left: 10px;

	> div {
		box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.6), 0 4px 10px 0 rgba(0, 0, 0, 0.6);
	}
`;

export const Name = styled.div`
	position: absolute;
	bottom: 4px;
	left: 70px;
	color: white;
	font-size: var(--font-size-large);
	font-weight: 900;
	padding: 2px;
`;

export const Content = styled.div`
	margin-bottom: 20px;
`;

export const Bio = styled.div`
	padding: 20px 10px;
	background-color: var(--color-card-background);
`;

export const TipsSection = styled.div`
	padding: 12px 10px;
	background-color: var(--color-card-background);
	border: 1px solid var(--color-border);
	border-radius: 8px;
	margin: 0 10px 15px 10px;
`;

export const TipsHeader = styled.div`
	font-size: var(--font-size-medium);
	font-weight: 700;
	margin-bottom: 8px;
	color: var(--color-text-primary);
`;

export const TipsList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
	max-height: 200px;
	overflow-y: auto;
`;

export const TipRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: var(--font-size-small);
	padding: 4px 0;

	.tip-amount {
		font-weight: 700;
		color: var(--color-success);
	}

	.tip-target {
		color: var(--color-text-secondary);
		margin-left: 4px;
	}

	.tip-date {
		color: var(--color-text-tertiary);
		margin-left: 6px;
		font-size: var(--font-size-xsmall);
	}

	a {
		color: var(--color-accent);
		text-decoration: none;
		font-size: var(--font-size-small);

		&:hover {
			text-decoration: underline;
		}
	}
`;

export const TipsPlaceholder = styled.div`
	font-size: var(--font-size-small);
	color: var(--color-text-tertiary);
	padding: 10px;
`;
