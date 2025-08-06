import styled from 'styled-components';
import { BREAKPOINTS } from 'engine/constants/breakpoints';

export const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  min-width:300px;
  max-width:300px;
  min-height:100%;
  margin-left:auto;
  box-sizing: border-box;  

  h2 {
    background: rgba(var(--color-primary),1);
    color: rgba(var(--color-primary-contrast),1);
    width: fit-content;
    margin:0;
    font-size:18px;
    padding:0 8px;
    // margin-top:20px;
    margin-top:0;
    margin-bottom:10px;
    border-radius:var(--border-radius);
    user-select:none;
  }

  @media (max-width: ${BREAKPOINTS["breakpoint-small"]}) {
    display:none;
  }
`;

export const SidebarCategory = styled.div`
  margin-bottom:20px;
`;

export const FNCategory = styled.div`
  margin-bottom:20px;
  font-weight:600;  
`;

export const FNEntry = styled.div<{ $level: number }>`
  margin-left:${(props) => `calc(10px * ${props.$level})`};
  font-size:14px;

  &:hover{
    cursor:pointer;
    color:rgba(var(--color-primary),1);
  }
`;

export const Podcast = styled.div`
  margin-bottom:20px;

  h3 {    
    margin-top:0;
    margin-bottom:6px;
    font-size:14px;
    line-height:18px;    
  }
`;


export const PodcastThumbnail = styled.div`
  img {    
    aspect-ratio: 16/9;
    object-fit: cover;
    max-width:100%;
    border-radius:0 0 var(--border-radius) var(--border-radius);
  }
`;


export const PodcastSource = styled.div`
  display: flex;
  align-items: center;
  gap:6px;
  font-size: var(--font-size-default);
  font-weight: 800;
  background: var(--color-post-background);
  padding: 4px 4px;
  border-radius: var(--border-radius) var(--border-radius) 0 0;

  img{    
    width:20px;
    height:20px;
    background:white;
    border-radius:50%;
  }
`;