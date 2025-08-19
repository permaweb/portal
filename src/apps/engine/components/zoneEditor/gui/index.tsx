import React, { useEffect, useState } from 'react';
import * as S from './styles';

export default function JsonGuiEditor(props) {
	const { value, onChange } = props;
	const [data, setData] = useState({});

	useEffect(() => {
		setData(value);
	}, [value]);

	const renderFields = (obj, path = []) =>
		Object.entries(obj).map(([k, v]) => {
			const fullPath = [...path, k];
			const key = fullPath.join('.');

			const handleChange = val => {
				const updated = structuredClone(data);
				let cur = updated;
				for (let i = 0; i < path.length; i++) cur = cur[path[i]];
				cur[k] = val;
				setData(updated);
				onChange(updated);
			};

			if (typeof v === 'boolean') {
				return (
					<label key={key}>
						{k}
						<input
							type="checkbox"
							checked={v}
							onChange={e => handleChange(e.target.checked)}
						/>
					</label>
				);
			}

			if (typeof v === 'string' || typeof v === 'number') {
				return (
					<label key={key}>
						{k}
						<input
							type="text"
							value={v}
							onChange={e => handleChange(e.target.value)}
						/>
					</label>
				);
			}

			if (typeof v === 'object' && v !== null) {
				return (
					<S.Row key={key} id="row">
						<S.CategoryKey>{k}</S.CategoryKey>
						{renderFields(v, fullPath)}
					</S.Row>
				);
			}

			return null;
		});

	return <S.GUI>{renderFields(data)}</S.GUI>;
}
