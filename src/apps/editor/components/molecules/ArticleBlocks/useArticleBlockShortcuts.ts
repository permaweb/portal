import React from 'react';

import { ArticleBlockEnum } from 'helpers/types';

const BLOCK_SHORTCUTS: Record<string, ArticleBlockEnum> = {
	'1': ArticleBlockEnum.Header1,
	'2': ArticleBlockEnum.Header2,
	'3': ArticleBlockEnum.Header3,
	'4': ArticleBlockEnum.Header4,
	'5': ArticleBlockEnum.Header5,
	'6': ArticleBlockEnum.Header6,
	p: ArticleBlockEnum.Paragraph,
	q: ArticleBlockEnum.Quote,
	c: ArticleBlockEnum.Code,
	n: ArticleBlockEnum.OrderedList,
	b: ArticleBlockEnum.UnorderedList,
	i: ArticleBlockEnum.Image,
	v: ArticleBlockEnum.Video,
	e: ArticleBlockEnum.Embed,
};

export function useArticleBlockShortcuts(options: {
	addBlock: (type: ArticleBlockEnum) => void;
	disabled?: boolean;
	enabled?: boolean;
	inline?: boolean;
}) {
	const { enabled = true, inline = false } = options;
	const optionsRef = React.useRef(options);
	optionsRef.current = options;

	React.useEffect(() => {
		if (!enabled) return;

		let pendingUntil = 0;
		const reset = () => {
			pendingUntil = 0;
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.defaultPrevented ||
				event.isComposing ||
				event.altKey ||
				event.metaKey ||
				optionsRef.current.disabled ||
				document.querySelector('[role="dialog"][aria-modal="true"]')
			) {
				reset();
				return;
			}
			if (event.repeat) return;

			if (event.ctrlKey && event.key === '/') {
				event.preventDefault();
				pendingUntil = Date.now() + 2000;
				return;
			}
			if (event.key === 'Control' || event.key === 'Shift') return;

			const pending = pendingUntil > 0 && Date.now() <= pendingUntil;
			reset();
			if (!pending) return;

			const blockType = BLOCK_SHORTCUTS[event.key.toLowerCase()];
			if (blockType) {
				event.preventDefault();
				optionsRef.current.addBlock(blockType);
			}
		};

		// Inline pickers replace their block; they take priority over the editor's insertion shortcut.
		const target = inline ? window : document;
		target.addEventListener('keydown', handleKeyDown, true);
		window.addEventListener('blur', reset);
		return () => {
			target.removeEventListener('keydown', handleKeyDown, true);
			window.removeEventListener('blur', reset);
		};
	}, [enabled, inline]);
}
