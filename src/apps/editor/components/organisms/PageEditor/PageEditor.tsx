import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { usePortalProvider } from 'editor/providers/PortalProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import Builder from 'engine/builder';
import * as S from './styles';

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

export default function PageEditor() {
  const navigate = useNavigate();
	const permawebProvider = usePermawebProvider();	
  const { pageId } = useParams<{ pageId?: string }>();
  const portalProvider = usePortalProvider();
  const languageProvider = useLanguageProvider();
  const language = languageProvider.object[languageProvider.current];
  const pageLayout = portalProvider.current.pages[pageId];

	console.log('pageLayout: ', pageLayout)

	const [input, setInput] = React.useState('');
	const [output, setOutput] = React.useState('');

	const textareaRef = React.useRef<HTMLTextAreaElement>(null);
	const preRef = React.useRef<HTMLPreElement>(null);
	const isSyncingScroll = React.useRef(false);

	React.useEffect(() => {
		if (pageLayout) {
			const value = pageLayout;
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
	}, [pageLayout]);

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
		/*
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

			const updateId = await permawebProvider.libs.updateZone(
				updateData,
				portalProvider.portalId,
				arProvider.wallet
			);

			console.log(`${selected} update:`, updateId);
		} catch {
			console.log('Invalid JSON, not saved');
		}
			*/
	};
	const isValid = output !== 'Invalid JSON';


  return (
    <S.Wrapper> 
			<h4>{pageId.charAt(0).toUpperCase() + pageId.slice(1)}</h4>
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
				<button onClick={handleSubmit}>Save</button>
			</S.Editor>
			<S.Preview className="border-wrapper-alt1">
				Preview...
			</S.Preview>
			{/* <Builder layout={pageLayout} preview={true} /> */}
    </S.Wrapper>
  );
}
