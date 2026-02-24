import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as S from './styles';

interface EmojiCategory {
	name: string;
	icon: string;
	emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
	{
		name: 'smileys',
		icon: '😊',
		emojis: [
			'😀',
			'😃',
			'😄',
			'😁',
			'😅',
			'😂',
			'🤣',
			'😊',
			'😇',
			'🙂',
			'😉',
			'😌',
			'😍',
			'🥰',
			'😘',
			'😋',
			'😛',
			'😜',
			'🤪',
			'😝',
			'🤔',
			'😐',
			'😏',
			'🙄',
			'😬',
			'😔',
			'😴',
			'😎',
			'🤓',
			'😕',
			'😟',
			'😮',
			'😲',
			'😳',
			'😢',
			'😭',
			'😱',
			'😤',
			'😡',
			'😈',
			'💀',
			'💩',
			'🤡',
		],
	},
	{
		name: 'gestures',
		icon: '👋',
		emojis: ['👋', '✋', '👌', '✌️', '🤞', '👈', '👉', '👆', '👇', '👍', '👎', '✊', '👊', '👏', '🙌', '🙏', '💪'],
	},
	{
		name: 'nature',
		icon: '🌲',
		emojis: [
			'🐶',
			'🐱',
			'🐭',
			'🐰',
			'🦊',
			'🐻',
			'🐼',
			'🐨',
			'🐯',
			'🦁',
			'🐮',
			'🐷',
			'🐸',
			'🐵',
			'🐔',
			'🐧',
			'🐦',
			'🦋',
			'🐌',
			'🐞',
			'🐝',
			'🐢',
			'🐍',
			'🐙',
			'🐬',
			'🐳',
			'🦈',
			'🐘',
			'🌵',
			'🎄',
			'🌲',
			'🌳',
			'🌴',
			'🌱',
			'🌿',
			'🍀',
			'🌷',
			'🌹',
			'🌻',
			'🔥',
			'🌈',
			'☀️',
			'⭐',
			'✨',
			'⚡',
			'🌊',
		],
	},
	{
		name: 'food',
		icon: '🍕',
		emojis: [
			'🍏',
			'🍎',
			'🍐',
			'🍊',
			'🍋',
			'🍌',
			'🍉',
			'🍇',
			'🍓',
			'🍒',
			'🍑',
			'🍍',
			'🍅',
			'🍆',
			'🥑',
			'🌽',
			'🥕',
			'🧀',
			'🍔',
			'🍟',
			'🍕',
			'🌮',
			'🍣',
			'🍰',
			'🍩',
			'🍪',
			'☕',
			'🍺',
			'🍷',
		],
	},
	{
		name: 'objects',
		icon: '⚽',
		emojis: [
			'⚽',
			'🏀',
			'🏈',
			'🎾',
			'🏆',
			'🥇',
			'🎭',
			'🎨',
			'🎬',
			'🎤',
			'🎧',
			'🎸',
			'🎲',
			'🎯',
			'🎮',
			'💻',
			'📱',
			'⌨️',
			'💡',
			'🔧',
			'🔑',
			'🎁',
			'🎈',
			'🎉',
		],
	},
	{
		name: 'symbols',
		icon: '❤️',
		emojis: [
			'❤️',
			'🧡',
			'💛',
			'💚',
			'💙',
			'💜',
			'🖤',
			'💔',
			'💯',
			'❌',
			'⭕',
			'✅',
			'❗',
			'❓',
			'🔥',
			'⚡',
			'💫',
			'⬆️',
			'⬇️',
			'➡️',
			'⬅️',
		],
	},
];

interface EmojiPickerProps {
	onInsertEmoji: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onInsertEmoji }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [activeCategory, setActiveCategory] = useState('smileys');
	const containerRef = useRef<HTMLDivElement>(null);
	const pickerRef = useRef<HTMLDivElement>(null);

	const isSearching = searchTerm.trim().length > 0;

	const filteredEmojis = useMemo(() => {
		if (!isSearching) {
			const category = EMOJI_CATEGORIES.find((c) => c.name === activeCategory);
			return category?.emojis || [];
		}

		const searchLower = searchTerm.toLowerCase();
		const allEmojis = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
		return allEmojis.filter((emoji) => {
			const emojiName = emoji.toLowerCase();
			return emojiName.includes(searchLower);
		});
	}, [searchTerm, activeCategory, isSearching]);

	const handleEmojiClick = (emoji: string) => {
		onInsertEmoji(emoji);
		setIsOpen(false);
		setSearchTerm('');
		setActiveCategory('smileys');
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => {
				document.removeEventListener('mousedown', handleClickOutside);
			};
		}
	}, [isOpen]);

	return (
		<S.Emojis ref={containerRef}>
			<S.EmojisIcon onClick={() => setIsOpen(!isOpen)}>
				<span>😊</span>
			</S.EmojisIcon>

			{isOpen && (
				<S.EmojiPicker ref={pickerRef}>
					<S.EmojiSearch>
						<S.EmojiSearchInput
							type="text"
							placeholder="Search emojis..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							autoFocus
						/>
					</S.EmojiSearch>

					{!isSearching && (
						<S.EmojiCategories>
							{EMOJI_CATEGORIES.map((category) => (
								<S.EmojiCategoryTab
									key={category.name}
									$active={activeCategory === category.name}
									onClick={() => setActiveCategory(category.name)}
									title={category.name}
								>
									{category.icon}
								</S.EmojiCategoryTab>
							))}
						</S.EmojiCategories>
					)}

					<S.EmojiGrid>
						{filteredEmojis.map((emoji, index) => (
							<S.EmojiButton key={`${emoji}-${index}`} onClick={() => handleEmojiClick(emoji)} title={emoji}>
								{emoji}
							</S.EmojiButton>
						))}
					</S.EmojiGrid>
				</S.EmojiPicker>
			)}
		</S.Emojis>
	);
};

export default EmojiPicker;
