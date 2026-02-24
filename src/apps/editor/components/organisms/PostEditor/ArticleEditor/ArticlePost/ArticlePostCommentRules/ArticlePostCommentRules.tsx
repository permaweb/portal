import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { Button } from 'components/atoms/Button';
import { Checkbox } from 'components/atoms/Checkbox';
import { FormField } from 'components/atoms/FormField';
import { Select } from 'components/atoms/Select';
import { ICONS, TIP_TOKEN_OPTIONS } from 'helpers/config';
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
	const tipTokenOptions = TIP_TOKEN_OPTIONS.map((token) => ({
		id: token.tokenAddress,
		label: token.label,
	}));
	const selectedTipAssetId = currentPost.data.commentRules?.tipAssetId ?? '';
	const hasSelectedPreset = tipTokenOptions.some((option) => option.id === selectedTipAssetId);
	const tipAssetSelectOptions =
		!selectedTipAssetId || hasSelectedPreset
			? tipTokenOptions
			: [{ id: selectedTipAssetId, label: `Custom token (${selectedTipAssetId.slice(0, 8)}...)` }, ...tipTokenOptions];
	const activeTipAssetOption =
		tipAssetSelectOptions.find((option) => option.id === selectedTipAssetId) ||
		tipTokenOptions.find((option) => option.label.toUpperCase() === 'AR') ||
		tipTokenOptions[0];

	// Load existing rules when component mounts
	React.useEffect(() => {
		if (!commentsId || !permawebProvider.libs || hasLoaded || !hasPermission) return;
		if (!permawebProvider.libs?.getRules) return;

		setLoading(true);
		permawebProvider.libs
			.getRules({ commentsId })
			.then((rules: any) => {
				console.log('[comment-rules] fetched rules raw:', {
					commentsId,
					rules,
				});
				if (rules) {
					const requireProfileThumbnail = rules.requireProfileThumbnail ?? rules.RequireProfileThumbnail;
					const enableTipping = rules.enableTipping ?? rules.EnableTipping;
					const requireTipToComment = rules.requireTipToComment ?? rules.RequireTipToComment;
					const showPaidTab = rules.showPaidTab ?? rules.ShowPaidTab;
					const highlightPaidComments = rules.highlightPaidComments ?? rules.HighlightPaidComments;
					const normalizedRules: CommentRulesType = {
						profileAgeRequired: rules.profileAgeRequired ?? rules.ProfileAgeRequired,
						mutedWords: rules.mutedWords ?? rules.MutedWords,
						requireProfileThumbnail: requireProfileThumbnail === 'true' || requireProfileThumbnail === true,
						enableTipping: enableTipping === 'true' || enableTipping === true,
						requireTipToComment: requireTipToComment === 'true' || requireTipToComment === true,
						tipAssetId: rules.tipAssetId ?? rules.TipAssetId ?? '',
						minTipAmount: rules.minTipAmount ?? rules.MinTipAmount ?? '0',
						showPaidTab: showPaidTab === 'true' || showPaidTab === true,
						highlightPaidComments: highlightPaidComments === 'true' || highlightPaidComments === true,
					};
					console.log('[comment-rules] normalized rules from process:', normalizedRules);
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
		const updatedRules: CommentRulesType = {
			...currentPost.data.commentRules,
			[field]: value,
		};
		// Ensure tipping always has a token selected so updates do not fail server-side.
		if (field === 'enableTipping' && value === true && !updatedRules.tipAssetId) {
			updatedRules.tipAssetId = activeTipAssetOption?.id || 'AR';
		}
		if (field === 'enableTipping') {
			console.log('[comment-rules] enableTipping changed:', {
				prev: currentPost.data.commentRules?.enableTipping,
				next: value,
				tipAssetIdAfterChange: updatedRules.tipAssetId,
			});
		}
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
				const normalizedTipAssetId =
					currentPost.data.commentRules.enableTipping && !(currentPost.data.commentRules.tipAssetId || '').trim()
						? activeTipAssetOption?.id || 'AR'
						: currentPost.data.commentRules.tipAssetId ?? '';
				const normalizedRulesForState: CommentRulesType = {
					profileAgeRequired: currentPost.data.commentRules.profileAgeRequired ?? 0,
					mutedWords: currentPost.data.commentRules.mutedWords ?? [],
					requireProfileThumbnail: !!currentPost.data.commentRules.requireProfileThumbnail,
					enableTipping: !!currentPost.data.commentRules.enableTipping,
					requireTipToComment: !!currentPost.data.commentRules.requireTipToComment,
					tipAssetId: normalizedTipAssetId,
					minTipAmount: currentPost.data.commentRules.minTipAmount ?? '0',
					showPaidTab: !!currentPost.data.commentRules.showPaidTab,
					highlightPaidComments: !!currentPost.data.commentRules.highlightPaidComments,
				};
				const rulesToSend = {
					ProfileAgeRequired: normalizedRulesForState.profileAgeRequired ?? 0,
					MutedWords: normalizedRulesForState.mutedWords ?? [],
					RequireProfileThumbnail: !!normalizedRulesForState.requireProfileThumbnail,
					EnableTipping: !!normalizedRulesForState.enableTipping,
					RequireTipToComment: !!normalizedRulesForState.requireTipToComment,
					TipAssetId: normalizedRulesForState.tipAssetId ?? '',
					MinTipAmount: normalizedRulesForState.minTipAmount ?? '0',
					ShowPaidTab: !!normalizedRulesForState.showPaidTab,
					HighlightPaidComments: !!normalizedRulesForState.highlightPaidComments,
				};
				console.log('[comment-rules] saving rules payload:', {
					commentsId,
					portalId: portalProvider.current.id,
					rulesToSend,
				});

				// Keep local state in sync with normalized payload used for persistence.
				handleCurrentPostUpdate({ field: 'commentRules', value: normalizedRulesForState });

				// Update rules via portal forwarding (canonical Run-Action format).
				const forwardResult = await permawebProvider.libs.sendMessage({
					processId: portalProvider.current.id,
					wallet: arProvider.wallet,
					action: 'Run-Action',
					tags: [
						{ name: 'Forward-To', value: commentsId },
						{ name: 'Forward-Action', value: 'Update-Rules' },
					],
					data: { Input: rulesToSend },
					returnResult: true,
				});
				console.log('[comment-rules] forwarded updateRules result:', forwardResult);
				const hadUpdateRulesError = (forwardResult?.Messages || []).some((message: any) => {
					const tags = message?.Tags || [];
					const actionTag = tags.find((tag: any) => tag?.name === 'Action')?.value;
					return actionTag === 'Update-Rules-Error';
				});
				if (hadUpdateRulesError) {
					const errorTag = (forwardResult?.Messages || [])
						.flatMap((message: any) => message?.Tags || [])
						.find((tag: any) => tag?.name === 'Error')?.value;
					throw new Error(errorTag || 'Update-Rules-Error');
				}

				addNotification(`${language?.commentRulesUpdated || 'Comment rules updated'}!`, 'success');
			} catch (e: any) {
				console.error('Error updating comment rules:', e);
				console.error('[comment-rules] save failed context:', {
					commentsId,
					portalId: portalProvider.current?.id,
					currentRules: currentPost.data.commentRules,
				});
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
	const tippingEnabled = currentPost.data.commentRules?.enableTipping ?? false;

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
				<FormField
					label={language?.profileAgeRequired}
					value={profileAgeDays}
					onChange={(e) => handleProfileAgeChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							e.nativeEvent.stopImmediatePropagation();
						}
					}}
					disabled={disabled || updating}
					invalid={{ status: false, message: null }}
					hideErrorMessage
					endText={language?.profileAgeRequiredDays}
					sm
					noMargin
				/>
				<S.RuleDescription>
					{language?.profileAgeRequiredDescription || 'Minimum days since profile creation to allow commenting'}
				</S.RuleDescription>
			</S.Section>

			<S.Section>
				<S.TagsWrapper>
					<S.InputWrapper>
						<FormField
							label={language?.mutedWords}
							placeholder={language?.mutedWordsPlaceholder}
							value={newWord}
							onChange={(e) => setNewWord(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									e.nativeEvent.stopImmediatePropagation();
									if (newWord.trim()) {
										handleAddWord();
									}
								}
							}}
							disabled={disabled || updating}
							invalid={{ status: false, message: null }}
							hideErrorMessage
							sm
							noMargin
						/>
						<S.AddButton>
							<Button
								type={'alt4'}
								label={language?.add || 'Add'}
								handlePress={handleAddWord}
								disabled={disabled || updating || !newWord.trim()}
								icon={ICONS.add}
								iconLeftAlign
							/>
						</S.AddButton>
					</S.InputWrapper>
					{mutedWords.length > 0 && (
						<S.TagsContainer>
							{mutedWords.map((word, index) => (
								<Button
									key={index}
									type={'alt3'}
									label={word}
									handlePress={() => handleRemoveMutedWord(word)}
									disabled={disabled || updating}
									active={false}
									icon={ICONS.remove}
								/>
							))}
						</S.TagsContainer>
					)}
				</S.TagsWrapper>
			</S.Section>

			<S.SectionDivider />

			<S.Section>
				<S.RuleItem>
					<S.RuleLabel>{language?.enableTipping || 'Enable Tipping'}</S.RuleLabel>
					<Checkbox
						checked={tippingEnabled}
						handleSelect={() => handleRuleChange('enableTipping', !tippingEnabled)}
						disabled={disabled || updating}
					/>
				</S.RuleItem>
				<S.RuleDescription>
					{language?.enableTippingDescription || 'Allow users to attach tips to their comments'}
				</S.RuleDescription>
			</S.Section>

			{tippingEnabled && (
				<>
					<S.Section>
						<S.RuleItem>
							<S.RuleLabel>{language?.requireTipToComment || 'Require Tip to Comment'}</S.RuleLabel>
							<Checkbox
								checked={currentPost.data.commentRules?.requireTipToComment ?? false}
								handleSelect={() =>
									handleRuleChange('requireTipToComment', !currentPost.data.commentRules?.requireTipToComment)
								}
								disabled={disabled || updating}
							/>
						</S.RuleItem>
						<S.RuleDescription>
							{language?.requireTipToCommentDescription || 'Users must attach a tip to post a comment'}
						</S.RuleDescription>
					</S.Section>

					<S.Section>
						<Select
							label={language?.tipAssetId || 'Tip Asset ID'}
							activeOption={activeTipAssetOption}
							setActiveOption={(option) => handleRuleChange('tipAssetId', option.id)}
							options={tipAssetSelectOptions}
							disabled={disabled || updating}
						/>
						<S.RuleDescription>
							{language?.tipAssetIdDescription || 'Select the token used for comment tips'}
						</S.RuleDescription>
					</S.Section>

					<S.Section>
						<FormField
							label={language?.minTipAmount || 'Minimum Tip Amount'}
							placeholder={'0'}
							value={currentPost.data.commentRules?.minTipAmount ?? '0'}
							onChange={(e) => handleRuleChange('minTipAmount', e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									e.nativeEvent.stopImmediatePropagation();
								}
							}}
							disabled={disabled || updating}
							invalid={{ status: false, message: null }}
							hideErrorMessage
							sm
							noMargin
						/>
						<S.RuleDescription>
							{language?.minTipAmountDescription || 'Minimum tip amount in base units'}
						</S.RuleDescription>
					</S.Section>

					<S.Section>
						<S.RuleItem>
							<S.RuleLabel>{language?.showPaidTab || 'Show Paid Tab'}</S.RuleLabel>
							<Checkbox
								checked={currentPost.data.commentRules?.showPaidTab ?? false}
								handleSelect={() => handleRuleChange('showPaidTab', !currentPost.data.commentRules?.showPaidTab)}
								disabled={disabled || updating}
							/>
						</S.RuleItem>
						<S.RuleDescription>
							{language?.showPaidTabDescription || 'Show a separate tab for paid/tipped comments'}
						</S.RuleDescription>
					</S.Section>

					<S.Section>
						<S.RuleItem>
							<S.RuleLabel>{language?.highlightPaidComments || 'Highlight Paid Comments'}</S.RuleLabel>
							<Checkbox
								checked={currentPost.data.commentRules?.highlightPaidComments ?? false}
								handleSelect={() =>
									handleRuleChange('highlightPaidComments', !currentPost.data.commentRules?.highlightPaidComments)
								}
								disabled={disabled || updating}
							/>
						</S.RuleItem>
						<S.RuleDescription>
							{language?.highlightPaidCommentsDescription || 'Show top paid comments in a highlighted strip'}
						</S.RuleDescription>
					</S.Section>
				</>
			)}

			<S.ActionWrapper>
				<Button
					type={'alt1'}
					label={language?.updateRules || 'Update Rules'}
					handlePress={handleUpdateRules}
					disabled={disabled || updating}
					loading={updating}
					icon={ICONS.save}
					iconLeftAlign
					height={40}
					fullWidth
				/>
			</S.ActionWrapper>
		</S.Wrapper>
	);
}
