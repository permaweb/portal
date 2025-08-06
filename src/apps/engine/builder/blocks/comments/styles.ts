import styled from 'styled-components';


export const Comments = styled.div`
	position:relative;
  display:flex;
	flex-direction: column;
  width:100%;
	max-width:100%;
  // background:var(--color-post-background);
  // padding:20px;
  box-sizing: border-box;
  border-radius:var(--border-radius);
  gap:20px;
  // box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
	margin-top:20px;

	h2{
		margin:0;
		font-size:22px;
	}
`;

export const CommentList = styled.div`
  display:flex;
  flex-direction: column;
  gap:20px;
`;