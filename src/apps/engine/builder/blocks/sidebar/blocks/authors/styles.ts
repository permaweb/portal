import styled from 'styled-components';

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
  width: fit-content;
  
  &:hover{
    cursor:pointer;
    color:rgba(var(--color-primary),1);
  }
`;
