import styled from 'styled-components';

const DESIGN_WIDTH = '372.5px';

export const Wrapper = styled.div`
	width: 100%;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`;

export const DesignWrapper = styled.div`
	height: 600px;
	width: ${DESIGN_WIDTH};
`;

export const PreviewWrapper = styled.div`
	height: calc(100vh - 205px);
	width: calc(100% - ${DESIGN_WIDTH} - 25px);

	display: flex;
	align-items: center;
	justify-content: center;
`;
