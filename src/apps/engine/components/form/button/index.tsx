// @flow
import type { Node } from 'react';
import React, { forwardRef, useRef } from 'react';
import * as S from './styles';

type Props = {
  label: string,
  type: string,
  icon?: string,  
  disabled?: boolean,
  onClick: (any) => any,
};

export default function Button(props: any) {
  const {
    label,
    type,
    disabled,
    onClick,
  } = props;

  return (

    <S.Button
      title={label}      
      aria-label={label}
      type={type}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick(e);
        }
      }}
      disabled={disabled}
    >{label}
    </S.Button>
  );
};