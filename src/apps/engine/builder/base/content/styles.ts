import styled from 'styled-components';


export const Content = styled.div`
  display:flex;
  justify-content: center;
  width:100%;    
  height:calc(100% - 40px);
  margin-bottom:120px;
  box-sizing: border-box;
  gap: 20px;
  z-index:1;
`;

export const FeedWrapper = styled.div`
  position: relative;
  display:flex;
  flex-direction: column;
  width:100%;
`;
