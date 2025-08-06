import styled from 'styled-components';

export const SidebarUserWrapper = styled.div`
  max-width: 100%;
`;

export const Header = styled.div`
  position: relative;
`;

export const Banner = styled.div`
  height:100px;
  overflow: hidden;
  img{
    width: 300px;
  }

  &::after{
    position: absolute;
    left: 0;
    bottom: 0;
    content: "";
    height: 100%;
    opacity: 1;
    width: 100%;
    background: linear-gradient(0deg, #0d0d0d, transparent 65%);
  }
`;

export const Avatar = styled.div`
  position: absolute;
  bottom:-12px;
  left:10px;

  img{
    width: 52px;
    height: 52px;
    border-radius: 50%;
    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, .6), 0 4px 10px 0 rgba(0, 0, 0, .6);
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
  margin-bottom:20px;
`;

export const Bio = styled.div`
  padding:20px 10px;
  background-color: var(--color-post-background);
`