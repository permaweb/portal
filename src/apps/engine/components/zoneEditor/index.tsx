import React, { useEffect, useRef, useState } from 'react';
import { ReactSVG } from 'react-svg';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS } from 'helpers/config';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import JsonGuiEditor from './gui';
import * as S from './styles';
import { IProps } from './types';

function colorizeJson(json) {
	const stringRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g;
	const strings = [];
	const placeholder = '___STRING_PLACEHOLDER___';

	json = json.replace(stringRegex, (match) => {
		strings.push(match);
		return placeholder;
	});

	json = json
		.replace(/\b(true|false|null)\b/g, '<span style="color:#ff6200">$&</span>')
		.replace(/\b-?\d+(\.\d+)?([eE][+-]?\d+)?\b/g, '<span style="color:#e11dff">$&</span>');

	let i = 0;
	json = json.replace(new RegExp(placeholder, 'g'), () => {
		const str = strings[i++];
		const isKey = /:$/.test(str);
		const color = isKey ? '#39FF14' : '#ffe100';
		return `<span style="color:${color}">${str}</span>`;
	});

	return json;
}

export default function ZoneEditor(props: IProps) {
	const { portal } = usePortalProvider();
	const zone = portal || {};
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [selected, setSelected] = useState('Layout');
	const [editorMode, setEditorMode] = useState('json');
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const preRef = useRef<HTMLPreElement>(null);
	const isSyncingScroll = useRef(false);
	const keys = Object.keys(zone).filter((k) => /^[A-Z]/.test(k));

	useEffect(() => {
		if (selected in zone) {
			const value = zone[selected];
			if (typeof value === 'object') {
				const str = JSON.stringify(value, null, 2);
				setInput(str);
				setOutput(str);
			} else {
				const str = JSON.stringify({ value }, null, 2);
				setInput(str);
				setOutput(str);
			}
		}
	}, [selected]);

	const syncScroll = (source: 'textarea' | 'pre') => {
		if (isSyncingScroll.current) return;
		isSyncingScroll.current = true;

		if (textareaRef.current && preRef.current) {
			if (source === 'textarea') {
				preRef.current.scrollTop = textareaRef.current.scrollTop;
			} else {
				textareaRef.current.scrollTop = preRef.current.scrollTop;
			}
		}

		setTimeout(() => {
			isSyncingScroll.current = false;
		}, 10);
	};

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const val = e.target.value;
		setInput(val);
		try {
			const parsed = JSON.parse(val);
			setOutput(JSON.stringify(parsed, null, 2));
		} catch {
			setOutput('Invalid JSON');
		}
	};

	const handleSubmit = async () => {
		try {
			const parsed = JSON.parse(input);
			if (!selected) return;

			let updateValue = parsed;
			if (typeof zone[selected] !== 'object') {
				updateValue = parsed.value !== undefined ? parsed.value : parsed;
			} else if (Array.isArray(parsed)) {
				updateValue = permawebProvider.libs.mapToProcessCase(parsed);
			}

			const updateData = { [selected]: updateValue };

			const updateId = await permawebProvider.libs.updateZone(updateData, portalProvider.portalId, arProvider.wallet);

			console.log(`${selected} update:`, updateId);
		} catch {
			console.log('Invalid JSON, not saved');
		}
	};

	const isValid = output !== 'Invalid JSON';

	return (
		<S.Wrapper $mode={portalProvider?.editorMode} id="ZoneEditor">
			<S.Actions $mode={portalProvider?.editorMode}>
				<div onClick={() => portalProvider?.setEditorMode(portalProvider?.editorMode === 'mini' ? 'full' : 'mini')}>
					<ReactSVG src={ICONS.arrow} />
				</div>
				<div onClick={() => portalProvider?.setEditorMode('hidden')}>
					<ReactSVG src={ICONS.close} />
				</div>
			</S.Actions>
			<S.Editor>
				<select value={selected} onChange={(e) => setSelected(e.target.value)}>
					<option value="">Select</option>
					{keys.map((k) => (
						<option key={k} value={k}>
							{k}
						</option>
					))}
				</select>
				<S.Code>
					<S.EditorModes>
						<S.EditorMode $active={editorMode === 'gui'} onClick={() => setEditorMode('gui')}>
							GUI
						</S.EditorMode>
						<S.EditorMode $active={editorMode === 'json'} onClick={() => setEditorMode('json')}>
							JSON
						</S.EditorMode>
					</S.EditorModes>
					{editorMode === 'json' ? (
						<textarea
							ref={textareaRef}
							value={input}
							onChange={handleChange}
							spellCheck={false}
							onScroll={() => syncScroll('textarea')}
						/>
					) : (
						<JsonGuiEditor
							value={JSON.parse(input)}
							onChange={(val) => {
								const str = JSON.stringify(val, null, 2);
								setInput(str);
								setOutput(str);
							}}
						/>
					)}
					<S.Pre
						ref={preRef}
						dangerouslySetInnerHTML={{
							__html: isValid ? colorizeJson(output) : '<span style="color:red">Invalid JSON</span>',
						}}
						onScroll={() => syncScroll('pre')}
					/>
				</S.Code>
				<button onClick={handleSubmit}>Save</button>
			</S.Editor>
		</S.Wrapper>
	);
}
