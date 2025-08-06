import styled from 'styled-components';
import { BREAKPOINTS } from 'engine/constants/breakpoints';

export const Wrapper = styled.div`	
	width:100%;
	@media (max-width: ${BREAKPOINTS["breakpoint-small"]}) {
		padding:var(--spacing-xxs);

		h1 {
			font-size:26px;
			margin-top:0;
		}
	}
`;

export const Podcasts = styled.div`
	display:flex;
	gap:20px;

	@media (max-width: ${BREAKPOINTS["breakpoint-small"]}) {
		flex-direction: column;
	}
`;

export const Podcast = styled.div`
	flex:1;

	img {
		width: 100%;
		aspect-ratio: 16/9;
		object-fit: cover;		
		transform: scale(1);
		transition: transform .4s;
	}
	
	h3{
		margin-top:6px;
	}

	&:hover{
		cursor:pointer;

		img{
			transform: scale(1.1);
		}
		h3{			
			color: rgba(var(--color-primary),1);
		}
	}
`;

export const Thumbnail = styled.div`
	width: 100%;
	aspect-ratio: 16/9;
	overflow:hidden;
`;

export const Meta = styled.div`
	display:flex;
	background: rgba(var(--color-secondary),1);
	color: rgba(var(--color-primary-contrast),1);
	width: fit-content;
	padding: 2px 4px;
	font-weight: 700;
	font-size: x-small;
	margin-bottom: 4px;
`;