import React from 'react';

import * as S from './styles';

interface JsonEditorProps {
	initialValue?: any;
	onSave?: (value: any) => Promise<void>;
	title?: string;
	loading?: boolean;
	saveButtonText?: string;
	loadingText?: string;
}

function colorizeJson(json: string): string {
	const stringRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g;
	const strings: string[] = [];
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

export default function JsonEditor({
	initialValue,
	onSave,
	title,
	loading = false,
	saveButtonText = 'Save',
	loadingText = 'Saving...',
}: JsonEditorProps) {
	const [input, setInput] = React.useState('');
	const [output, setOutput] = React.useState('');
	const [isLoading, setIsLoading] = React.useState(false);

	const textareaRef = React.useRef<HTMLTextAreaElement>(null);
	const preRef = React.useRef<HTMLPreElement>(null);
	const isSyncingScroll = React.useRef(false);

	React.useEffect(() => {
		if (initialValue !== undefined) {
			const value = initialValue;
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
	}, [initialValue]);

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
		if (!onSave) return;

		try {
			setIsLoading(true);
			const parsed = JSON.parse(input);
			await onSave(parsed);
		} catch (error) {
			console.error('Error saving:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const isValid = output !== 'Invalid JSON';
	const buttonDisabled = loading || isLoading || !isValid || !onSave;

	return (
		<S.Wrapper>
			{title && <h4>{title}</h4>}
			<S.Editor className="border-wrapper-alt1">
				<S.Code>
					<textarea
						ref={textareaRef}
						value={input}
						onChange={handleChange}
						spellCheck={false}
						onScroll={() => syncScroll('textarea')}
					/>
					<S.Pre
						ref={preRef}
						dangerouslySetInnerHTML={{
							__html: isValid ? colorizeJson(output) : '<span style="color:red">Invalid JSON</span>',
						}}
						onScroll={() => syncScroll('pre')}
					/>
				</S.Code>
				{onSave && (
					<button
						onClick={handleSubmit}
						disabled={buttonDisabled}
						style={{
							opacity: buttonDisabled ? 0.5 : 1,
							cursor: buttonDisabled ? 'not-allowed' : 'pointer',
						}}
					>
						{loading || isLoading ? loadingText : saveButtonText}
					</button>
				)}
			</S.Editor>
		</S.Wrapper>
	);
}
