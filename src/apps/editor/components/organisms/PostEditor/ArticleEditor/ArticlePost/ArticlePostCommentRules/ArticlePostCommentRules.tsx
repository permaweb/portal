import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { Button } from 'components/atoms/Button';
import { Checkbox } from 'components/atoms/Checkbox';
import { ICONS } from 'helpers/config';
import { CommentRulesType, PortalUserType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function ArticlePostCommentRules() {
	const { assetId } = useParams<{ assetId?: string }>();
	const dispatch = useDispatch();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

	const [loading, setLoading] = React.useState<boolean>(false);
	const [updating, setUpdating] = React.useState<boolean>(false);
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

	// Get comments process ID from portal assets or current post data
	const commentsId = React.useMemo(() => {
		if (currentPost.data?.commentsId) return currentPost.data.commentsId;
		if (!assetId || !portalProvider.current?.assets) return null;
		const asset = portalProvider.current.assets.find((a: any) => a.id === assetId);
		return asset?.metadata?.comments || null;
	}, [assetId, portalProvider.current?.assets, currentPost.data?.commentsId]);

	const disabled = currentPost.editor?.loading?.active || !hasPermission;

	// Load existing rules when component mounts
	React.useEffect(() => {
		if (!commentsId || !permawebProvider.libs || hasLoaded || !hasPermission) return;
		if (!permawebProvider.libs?.getRules) return;

		setLoading(true);
		permawebProvider.libs
			.getRules({ commentsId })
			.then((rules: any) => {
				if (rules) {
					const requireProfileThumbnail = rules.requireProfileThumbnail ?? rules.RequireProfileThumbnail;
					const normalizedRules: CommentRulesType = {
						profileAgeRequired: rules.profileAgeRequired ?? rules.ProfileAgeRequired,
						mutedWords: rules.mutedWords ?? rules.MutedWords,
						requireProfileThumbnail: requireProfileThumbnail === 'true' || requireProfileThumbnail === true,
					};
					handleCurrentPostUpdate({ field: 'commentRules', value: normalizedRules });
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

	const handleUpdateRules = async () => {
		if (commentsId && arProvider.wallet && portalProvider.current?.id && currentPost.data.commentRules) {
			setUpdating(true);
			try {
				const rulesToSend = {
					ProfileAgeRequired: currentPost.data.commentRules.profileAgeRequired ?? 0,
					MutedWords: currentPost.data.commentRules.mutedWords ?? [],
					RequireProfileThumbnail: !!currentPost.data.commentRules.requireProfileThumbnail,
				};

				await permawebProvider.libs.sendMessage({
					processId: portalProvider.current.id,
					wallet: arProvider.wallet,
					action: 'Run-Action',
					tags: [
						{ name: 'Forward-To', value: commentsId },
						{ name: 'Forward-Action', value: 'Update-Rules' },
					],
					data: { Input: rulesToSend },
				});

				addNotification(`${language?.commentRulesUpdated || 'Comment rules updated'}!`, 'success');
			} catch (e: any) {
				console.error('Error updating comment rules:', e);
				addNotification(e.message ?? language?.errorUpdatingCommentRules, 'warning');
			}
			setUpdating(false);
		}
	};

	// Only show if post has comments process
	if (!commentsId || !hasPermission) {
		return (
			<S.WrapperEmpty>
				<p>{language?.noCommentRules}</p>
			</S.WrapperEmpty>
		);
	}

	if (loading) {
		return (
			<S.WrapperEmpty>
				<p>{language?.fetching}...</p>
			</S.WrapperEmpty>
		);
	}

	const mutedWords = currentPost.data.commentRules?.mutedWords || [];
	const profileAgeRequired = currentPost.data.commentRules?.profileAgeRequired || 0;
	const profileAgeDays = Math.floor(profileAgeRequired / (24 * 60 * 60 * 1000));

	return (
		<S.Wrapper>
			<S.Section>
				<S.RuleItem>
					<S.RuleLabel>{language?.requireProfileThumbnail}</S.RuleLabel>
					<Checkbox
						checked={currentPost.data.commentRules?.requireProfileThumbnail ?? false}
						handleSelect={() =>
							handleRuleChange('requireProfileThumbnail', !currentPost.data.commentRules?.requireProfileThumbnail)
						}
						disabled={disabled || updating}
					/>
				</S.RuleItem>
				<S.RuleDescription>
					{language?.requireProfileThumbnailDescription || 'Only users with a profile picture can comment'}
				</S.RuleDescription>
			</S.Section>

			<S.Section>
				<S.RuleItem>
					<S.RuleLabel>{language?.profileAgeRequired}</S.RuleLabel>
					<S.InputGroup>
						<S.NumberInput
							type="number"
							min="0"
							value={profileAgeDays}
							onChange={(e) => handleProfileAgeChange(e.target.value)}
							disabled={disabled || updating}
						/>
						<span>{language?.profileAgeRequiredDays}</span>
					</S.InputGroup>
				</S.RuleItem>
				<S.RuleDescription>
					{language?.profileAgeRequiredDescription || 'Minimum days since profile creation to allow commenting'}
				</S.RuleDescription>
			</S.Section>

			<S.Section>
				<S.MutedWordsLabel>{language?.mutedWords}</S.MutedWordsLabel>
				<S.TagsWrapper>
					<S.InputWrapper>
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
							disabled={disabled || updating}
						/>
						<S.AddButton onClick={handleAddWord} disabled={disabled || updating || !newWord.trim()} type="button">
							{language?.add || 'Add'}
						</S.AddButton>
					</S.InputWrapper>
					{mutedWords.length > 0 && (
						<S.TagsContainer>
							{mutedWords.map((word, index) => (
								<S.Tag key={index}>
									<span>{word}</span>
									<S.RemoveButton onClick={() => handleRemoveMutedWord(word)} disabled={disabled || updating}>
										×
									</S.RemoveButton>
								</S.Tag>
							))}
						</S.TagsContainer>
					)}
				</S.TagsWrapper>
			</S.Section>
			<S.ActionWrapper>
				<Button
					type={'primary'}
					label={language?.updateRules || 'Update Rules'}
					handlePress={handleUpdateRules}
					disabled={disabled || updating}
					loading={updating}
					icon={ICONS.add}
					iconLeftAlign
					height={40}
					fullWidth
				/>
			</S.ActionWrapper>
		</S.Wrapper>
	);
}
