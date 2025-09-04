import styled from 'styled-components';

export const Wrapper = styled.div``;

export const Header = styled.div`
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 15px;
	h4 {
		font-size: clamp(18px, 3.25vw, 24px);
		line-height: 1.5;
	}
`;

export const Body = styled.div`
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	gap: 10px;
	padding: 20px;
`;

export const Form = styled.div`
	display: flex;
	flex-direction: column;
	height: fit-content;
	width: 100%;

	label {
		margin-top: 10px;
		font-size: 12px;
		font-weight: 600;
	}

	input {
		font-size: 16px;
		padding: 4px 6px;
		outline: none;
		border: 1px solid transparent;

		&:focus {
			border: 1px solid rgba(var(--color-primary), 1);
		}
	}

	textarea {
		height: 240px !important;
		width: 100%;
		font-size: 16px;
		padding: 4px 6px;
		box-sizing: border-box;
		outline: none;
		border: 1px solid transparent;

		&:focus {
			border: 1px solid rgba(var(--color-primary), 1);
		}
	}
`;

export const TForm = styled.div`
	display: flex;
	flex-direction: column;
	margin: 20px 0 30px 0;
`;

export const PWrapper = styled.div`
	height: fit-content;
	min-width: 500px;
	width: calc(50% - 20px);
	flex: 1;
	input {
		display: none;
	}
`;

export const CWrapper = styled.div`
	display: flex;
	align-items: center;
	span {
		display: block;
		max-width: 75%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.c-wrapper-checkbox {
		margin: 4.5px 0 0 7.5px;
	}
`;

export const BWrapper = styled.div`
	width: 100%;
	position: relative;
`;

export const BannerInput = styled.button<{ $hasBanner: boolean }>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 200px;
	width: 100%;
	// border: ${(props) => (props.$hasBanner ? `none` : `1px dashed rgba(var(--color-primary), 1)`)};
	overflow: hidden;
	padding: 0;
	span {
	}
	svg {
		height: 35px;
		width: 35px;
		margin: 0 0 10px 0;
	}
	img {
		height: 200px;
		width: 100%;
		object-fit: cover;
	}
	&:hover {
		outline: 1px dashed rgba(var(--color-primary), 1);
		outline-offset: -1px;
		color: rgba(var(--color-primary), 1);
	}
	&:focus {
		opacity: 1;
	}
	&:disabled {
	}

	${(props) =>
		props.$hasBanner && !props.disabled
			? `
        pointer-events: all;
        ::after {
					content: "";
					position: absolute;
					height: 200px;
					width: 100%;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					opacity: 0;
					transition: all 100ms;
        }
        
        &:hover::after {
          opacity: 1;
        }
        &:focus::after {
          opacity: 1;
        }
        &:hover {
					cursor: pointer;
					border: none;
        }
    `
			: ''}
`;

export const AvatarInput = styled.button<{ $hasAvatar: boolean }>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 115px;
	width: 115px;
	border-radius: 50%;
	position: absolute;
	bottom: -55px;
	left: 20px;
	z-index: 1;
	overflow: hidden;
	padding: 0;
	// border: ${(props) => (props.$hasAvatar ? `none` : `1px dashed rgba(var(--color-primary), 1)`)};

	span {
	}
	svg {
		height: 25px;
		width: 25px;
		margin: 0 0 5px 0;
	}
	img {
		height: 100%;
		width: 100%;
		border-radius: 50%;
		object-fit: cover;
	}
	&:hover {
		outline: 1px dashed rgba(var(--color-primary), 1);
		outline-offset: -1px;
		color: rgba(var(--color-primary), 1);
	}
	&:focus {
		opacity: 1;
	}
	&:disabled {
	}
	${(props) =>
		props.$hasAvatar && !props.disabled
			? `
        pointer-events: all;
        ::after {
            content: "";
            position: absolute;
            height: 100%;
            width: 100%;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0;
            transition: all 100ms;
        }
        &:hover::after {
            opacity: 1;
        }
        &:focus::after {
            opacity: 1;
        }
        &:hover {
            cursor: pointer;
            border: none;
        }
    `
			: ''}
`;

export const ImageActions = styled.div`
	display: flex;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 10px;
	margin-top: 10px;
`;

export const PInfoMessage = styled.div`
	margin: 15px 0 0 0;
	display: flex;
	justify-content: flex-end;
	span {
		line-height: 1.5;
	}
`;

export const SAction = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	flex-wrap: wrap;
	gap: 10px;
	position: relative;
`;

export const Message = styled.div`
	position: absolute;
	left: 0;
	span {
		line-height: 1.5;
	}
`;

export const MWrapper = styled.div`
	padding: 0 20px 20px 20px;
`;

export const MInfo = styled.div`
	margin: 0 0 20px 0;
	span {
		line-height: 1.5;
	}
`;

export const MActions = styled.div`
	margin: 10px 0 0 0;
	display: flex;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 15px;
`;

export const MInfoWrapper = styled.div`
	width: fit-content;
	margin: 20px 0 0 auto;
	span {
		text-align: center;
		display: block;
		padding: 2.5px 12.5px;
		margin: 0 0 7.5px 0;
	}
`;
