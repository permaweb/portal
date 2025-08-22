import styled from 'styled-components';
import { BREAKPOINTS } from 'engine/constants/breakpoints';

export const Post = styled.div<{ $layout: any }>`
  position:relative;
  display:flex;
  // flex-direction: ${(props: any) => props.$layout?.flow === 'column' ? `column` : `row` };
  width:100%;
  background:var(--color-card-background);
  padding-top:40px;
  box-sizing: border-box;
  border-radius:var(--border-radius);
  gap:20px;
  box-shadow: ${(props: any) => props.$layout?.shadow ? `0 4px 10px rgba(0, 0, 0, 0.4)` : `unset` };  
  border-top: 2px solid var(--color-card-border);
  margin-bottom:21px;
`;

export const Categories = styled.div`
  position:absolute;
  display:flex;
  top:0px;
  left:0px;  
  color: var(--color-card-border-contrast);
  background-color: var(--color-card-border);
  padding: 5px 15px 4px;
  border-radius: 0 0 0 var(--border-radius);
  font-size:12px;
  font-weight:600;
  user-select:none;


`;

export const Category = styled.div`
  color: var(--color-card-border-contrast);
`;

export const Content = styled.div`
  display: flex;
  position: relative;
  flex:2;
  gap: 20px;

  img{
    width:100%;
    aspect-ratio: 16/6;
    border-radius:var(--border-radius);
    background:rgba(100,100,100,.2);
    box-shadow: none;
    object-fit: cover;

    &:hover{
      cursor:pointer;
    }
  }

  h2 {
    margin-top:var(--spacing-xs);
    margin-bottom:6px;
    line-height:28px;
    color: var(--color-card-title);

    &:hover{
      cursor:pointer;
      color:rgba(var(--color-primary),1);
    }
  }

  p {
    opacity:.8;
  }
`;

export const SideA = styled.div`
  flex: 2;
`;

export const SideB = styled.div`
  flex: 3;
`;

export const Meta = styled.div`
  display: flex;
  align-items: center;
  gap:6px;
  font-size: var(--font-size-default);
  font-weight: 800;
  margin-top:10px;

  img{
    width:18px;
    height:18px;
    background:white;
    border-radius: 50%;
  }
`;

export const SourceIcon = styled.img`
	width:20px;
	height:20px;
	border-radius:50%;
`;

export const Source = styled.div`
	margin-left:4px;  

  &:hover{
		cursor:pointer;
		color:rgba(var(--color-primary),1);
	}
`;

export const Author = styled.div`
	&:hover{
		cursor:pointer;
		color:rgba(var(--color-primary),1);
	}
`;

export const Comments = styled.div`
  display:flex;
  flex-direction: column;
  gap:20px;
  flex:1;

  h3{
    margin:0;
    user-select:none;
  }

  @media (max-width: ${BREAKPOINTS["breakpoint-small"]}) {
    border-top:1px solid rgba(var(--color-text),.4);
    padding-top:var(--spacing-s);
  }
`;

export const Comment = styled.div``;

export const CommentHeader = styled.div`
  display:flex;
  align-items: center;
  gap:6px;
  margin-bottom:2px;
`;

export const CommentText = styled.div`
  font-size:12px;
  opacity:.8;
`;

export const Avatar = styled.div`
  width:18px;
  height: 18px;
  background:rgba(var(--color-text),.5);
  border-radius:50%;

  img {
    width:18px;
    height: 18px;
    border-radius:50%;
  }
`;

export const Username = styled.div`
  font-size:var(--font-size-default);
  font-weight:800;
`;

export const Date = styled.div`
  font-size:12px;
  opacity:.6;
`;