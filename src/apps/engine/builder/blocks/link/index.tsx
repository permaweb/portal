// import React from 'react';
import { NavLink } from 'react-router-dom';

import * as S from './styles';

export default function Link(props: any) {
	const { target, to, label } = props;

	return target !== '_blank' ? (
		<NavLink to={to}>{label}</NavLink>
	) : (
		<a href={to} target={target}>
			{label}
		</a>
	);
}
