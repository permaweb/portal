import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { Checkbox } from 'components/atoms/Checkbox';
import { CommentRulesType, PortalUserType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function ArticlePostCommentRules() {
	const { assetId } = useParams<{ assetId?: string }>();
	const dispatch = useDispatch();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [loading, setLoading] = React.useState<boolean>(false);
	const [hasLoaded, setHasLoaded] = React.useState<boolean>(false);
	const [newWord, setNewWord] = React.useState<string>('');

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	// Permission checking
	const currentUser = portalProvider.current?.users?.find(
		(user: PortalUserType) => user.address === permawebProvider.profile?.id
	);

	const isPostCreator = currentPost.data?.creator === permawebProvider.profile?.id;
	const isAdmin = currentUser?.roles?.includes('Admin');
	const isModerator = currentUser?.roles?.includes('Moderator');
	const hasPermission = isPostCreator || isAdmin || isModerator;

	// Get comments process ID from portal assets
	const commentsId = React.useMemo(() => {
		if (!assetId || !portalProvider.current?.assets) return null;
		const asset = portalProvider.current.assets.find((a: any) => a.id === assetId);
		return asset?.metadata?.comments || null;
	}, [assetId, portalProvider.current?.assets]);

	const disabled = currentPost.editor?.loading?.active || !hasPermission;

	// Load existing rules when component mounts
	React.useEffect(() => {
		if (!commentsId || !permawebProvider.libs || hasLoaded || !hasPermission) return;

		setLoading(true);
		if (!permawebProvider.libs?.getRules) return;
		permawebProvider.libs
			?.getRules({ commentsId })
			.then((rules: CommentRulesType) => {
				if (rules) {
					handleCurrentPostUpdate({ field: 'commentRules', value: rules });
				}
				setHasLoaded(true);
			})
			.catch((error: any) => {
				console.error('Error fetching comment rules:', error);
				setHasLoaded(true);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [commentsId, permawebProvider.libs, hasLoaded, hasPermission]);

	const handleRuleChange = (field: keyof CommentRulesType, value: any) => {
		const updatedRules = {
			...currentPost.data.commentRules,
			[field]: value,
		};
		handleCurrentPostUpdate({ field: 'commentRules', value: updatedRules });
	};

	const handleProfileAgeChange = (value: string) => {
		const numValue = parseInt(value, 10);
		if (!isNaN(numValue) && numValue >= 0) {
			// Convert days to milliseconds
			const ageInMs = numValue * 24 * 60 * 60 * 1000;
			handleRuleChange('profileAgeRequired', ageInMs);
		} else if (value === '' || value === '0') {
			handleRuleChange('profileAgeRequired', 0);
		}
	};

	const handleAddWord = () => {
		const trimmedWord = newWord.trim();
		if (!trimmedWord) return;

		const mutedWords = currentPost.data.commentRules?.mutedWords || [];
		if (!mutedWords.includes(trimmedWord)) {
			handleRuleChange('mutedWords', [...mutedWords, trimmedWord]);
		}
		setNewWord('');
	};

	const handleRemoveMutedWord = (word: string) => {
		const mutedWords = currentPost.data.commentRules?.mutedWords || [];
		handleRuleChange(
			'mutedWords',
			mutedWords.filter((w) => w !== word)
		);
	};

	// Only show if post has comments process
	if (!commentsId || !hasPermission) {
		return null;
	}

	if (loading) {
		return (
			<S.Wrapper>
				<span>{language?.fetching}...</span>
			</S.Wrapper>
		);
	}

	const mutedWords = currentPost.data.commentRules?.mutedWords || [];
	const profileAgeRequired = currentPost.data.commentRules?.profileAgeRequired || 0;
	const profileAgeDays = Math.floor(profileAgeRequired / (24 * 60 * 60 * 1000));

	return (
		<S.Wrapper>
			{/* Profile Age Requirement */}
			<S.RuleItem>
				<S.RuleLabel>{language?.profileAgeRequired}</S.RuleLabel>
				<S.InputGroup>
					<S.NumberInput
						type="number"
						min="0"
						value={profileAgeDays}
						onChange={(e) => handleProfileAgeChange(e.target.value)}
						disabled={disabled}
					/>
					<span>{language?.profileAgeRequiredDays}</span>
				</S.InputGroup>
			</S.RuleItem>

			{/* Muted Words */}
			<S.RuleItem>
				<S.RuleLabel>{language?.mutedWords}</S.RuleLabel>
				<S.TagsWrapper>
					{mutedWords.map((word, index) => (
						<S.Tag key={index}>
							<span>{word}</span>
							<S.RemoveButton onClick={() => handleRemoveMutedWord(word)} disabled={disabled}>
								×
							</S.RemoveButton>
						</S.Tag>
					))}
					<S.Input
						type="text"
						placeholder={language?.mutedWordsPlaceholder}
						value={newWord}
						onChange={(e) => setNewWord(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && newWord.trim()) {
								e.preventDefault();
								handleAddWord();
							}
						}}
						disabled={disabled}
					/>
				</S.TagsWrapper>
			</S.RuleItem>

			{/* Require Profile Thumbnail */}
			<S.RuleItem>
				<S.HeaderWrapper>
					<S.RuleLabel>{language?.requireProfileThumbnail}</S.RuleLabel>
					<Checkbox
						checked={currentPost.data.commentRules?.requireProfileThumbnail ?? false}
						handleSelect={() =>
							handleRuleChange('requireProfileThumbnail', !currentPost.data.commentRules?.requireProfileThumbnail)
						}
						disabled={disabled}
					/>
				</S.HeaderWrapper>
			</S.RuleItem>
		</S.Wrapper>
	);
}
