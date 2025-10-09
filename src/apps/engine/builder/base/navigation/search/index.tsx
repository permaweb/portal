import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { ICONS } from 'helpers/config';
import { getRedirect } from 'helpers/utils';

import * as S from './styles';

export default function Search(props: any) {
	const [useSearch, setUseSearch] = React.useState(false);
	const [term, setTerm] = React.useState('');
	const searchRef = React.useRef(null);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setUseSearch(false);
			}
		};

		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	React.useEffect(() => {
		if (useSearch) inputRef.current?.focus();
	}, [useSearch]);

	return (
		<S.Search ref={searchRef} $active={useSearch} onClick={() => setUseSearch(true)}>
			<ReactSVG src={ICONS.ENGINE.search} />
			<input
				ref={inputRef}
				type="text"
				value={useSearch ? term : ''}
				onChange={(e) => setTerm(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') navigate(getRedirect(`search/${encodeURIComponent(term)}`));
				}}
			/>
		</S.Search>
	);
}
