import React from 'react';
import { NavLink } from 'react-router-dom';
import Avatar from 'engine/components/avatar';
import ContextMenu, { MenuItem } from 'engine/components/contextMenu';
import Button from 'engine/components/form/button';
import ModalPortal from 'engine/components/modalPortal';
import Placeholder from 'engine/components/placeholder';
import { usePosts } from 'engine/hooks/posts';
import { useProfile } from 'engine/hooks/profiles';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { SelectOptionType } from 'helpers/types';
import { getRedirect } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function CategorySpotlight(props: any) {
	const { portal } = usePortalProvider();
	const { profile: user } = usePermawebProvider();
	const { category, tag, onSetCategory } = props;

	// Use the first category if category is null
	const defaultCategory =
		!category && portal?.Categories && portal.Categories.length > 0
			? portal.Categories[0]?.name || portal.Categories[0]?.id
			: category;

	const { Posts, isLoading: isLoadingPosts } = usePosts({ category: defaultCategory });

	const [showSetCategoryModal, setShowSetCategoryModal] = React.useState(false);
	const [selectedCategory, setSelectedCategory] = React.useState<SelectOptionType | null>(null);
	const [filterText, setFilterText] = React.useState('');

	const roles = Array.isArray(user?.roles) ? user.roles : user?.roles ? [user.roles] : [];
	const isAdmin = user?.owner && roles && ['Admin', 'Moderator'].some((r) => roles?.includes(r));

	const categoryOptions: SelectOptionType[] = React.useMemo(() => {
		if (!portal?.Categories || !Array.isArray(portal.Categories)) return [];
		return portal.Categories.map((c: any) => ({
			id: c.id || c.name,
			label: c.name || c.id,
		}));
	}, [portal?.Categories]);

	const filteredOptions = React.useMemo(() => {
		if (!filterText) return categoryOptions;
		return categoryOptions.filter((o) => o.label.toLowerCase().includes(filterText.toLowerCase()));
	}, [categoryOptions, filterText]);

	React.useEffect(() => {
		if (showSetCategoryModal && defaultCategory && categoryOptions.length > 0 && !selectedCategory) {
			const currentOption = categoryOptions.find((opt) => opt.id === defaultCategory || opt.label === defaultCategory);
			if (currentOption) setSelectedCategory(currentOption);
		}
	}, [showSetCategoryModal]);

	const handleSetCategory = () => {
		if (selectedCategory && onSetCategory) {
			onSetCategory(selectedCategory.id);
		}
		setShowSetCategoryModal(false);
		setFilterText('');
	};

	const handleCloseModal = () => {
		setShowSetCategoryModal(false);
		setFilterText('');
	};

	const menuEntries: MenuItem[] = [];
	if (isAdmin) {
		menuEntries.push({
			icon: ICONS.featuredCategory,
			label: 'Set category',
			onClick: () => setShowSetCategoryModal(true),
		});
	}

	const LeftRow = (props: any) => {
		const { post, index } = props;
		const { profile, isLoading: isLoadingProfile } = useProfile(post?.creator || null);

		return (
			<NavLink to={getRedirect(`post/${post.id}`)} className={isLoadingPosts ? 'disabledLink' : ''}>
				<S.LeftEntry>
					<S.LeftThumbnail>
						<img
							className="loadingThumbnail"
							onLoad={(e) => e.currentTarget.classList.remove('loadingThumbnail')}
							src={!isLoadingPosts && post?.metadata?.thumbnail ? getTxEndpoint(post.metadata.thumbnail) : null}
						/>
						<span>{index + 1}</span>
					</S.LeftThumbnail>
					<S.LeftMeta>
						<S.LeftTitle>{isLoadingPosts ? <Placeholder /> : post.name}</S.LeftTitle>
						<S.LeftSource>
							<Avatar profile={profile} isLoading={isLoadingProfile} size={18} />
							By <span>{isLoadingProfile ? <Placeholder /> : profile?.displayName}</span>
						</S.LeftSource>
					</S.LeftMeta>
				</S.LeftEntry>
			</NavLink>
		);
	};

	const RightRow = (props: any) => {
		const { post, index } = props;
		const { profile, isLoading: isLoadingProfile } = useProfile(post?.creator || null);

		return (
			<NavLink to={getRedirect(`post/${post?.id}`)} className={isLoadingPosts ? 'disabledLink' : ''}>
				<S.RightEntry>
					<S.RightThumbnail>
						<img
							className="loadingThumbnail"
							onLoad={(e) => e.currentTarget.classList.remove('loadingThumbnail')}
							src={!isLoadingPosts && post?.metadata?.thumbnail ? getTxEndpoint(post.metadata.thumbnail) : null}
						/>
						<S.RightTitle>
							<span className={isLoadingPosts ? 'loadingPlaceholder' : ''}>
								{isLoadingPosts ? (
									<>
										&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
									</>
								) : (
									post.name
								)}
							</span>
						</S.RightTitle>
						<S.RightSource>
							<Avatar profile={profile} isLoading={isLoadingProfile} size={18} />
							By <span>{isLoadingProfile ? <Placeholder /> : profile?.displayName}</span>
						</S.RightSource>
					</S.RightThumbnail>
				</S.RightEntry>
			</NavLink>
		);
	};

	return (
		<>
			<S.CategorySpotlight>
				{menuEntries.length > 0 && (
					<S.MenuWrapper onClick={(e) => e.preventDefault()}>
						<ContextMenu entries={menuEntries} />
					</S.MenuWrapper>
				)}
				<h1>{isLoadingPosts ? <Placeholder width="200" /> : tag ? `#{tag}` : `${defaultCategory}`}</h1>
				<S.CategorySpotlightGrid>
					<S.Left>
						{Object.values(Posts || [0, 1, 2, 3, 4, 5])
							?.slice(0, 6)
							.map((post: any, index: number) => (
								<LeftRow post={post} key={index} index={index} />
							))}
					</S.Left>
					<S.Right>
						{Object.values(Posts || [0, 1, 2, 3, 4, 5, 6, 7, 8])
							?.slice(6, 9)
							.map((post: any, index: number) => (
								<RightRow post={post} key={index} index={index} />
							))}
					</S.Right>
				</S.CategorySpotlightGrid>
			</S.CategorySpotlight>
			{showSetCategoryModal && (
				<ModalPortal>
					<S.ModalOverlay onClick={handleCloseModal}>
						<S.ModalContainer onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<span>Set Spotlight Category</span>
								<S.ModalClose onClick={handleCloseModal}>×</S.ModalClose>
							</S.ModalHeader>
							<S.ModalContent>
								<S.ModalLabel>Select a category</S.ModalLabel>
								<S.ModalFilterInput
									type="text"
									placeholder="Filter categories..."
									value={filterText}
									onChange={(e) => setFilterText(e.target.value)}
								/>
								<S.ModalSelect
									value={selectedCategory?.id || ''}
									onChange={(e) => {
										const option = categoryOptions.find((o) => o.id === e.target.value);
										if (option) setSelectedCategory(option);
									}}
								>
									<option value="" disabled>
										Select a category
									</option>
									{filteredOptions.map((option) => (
										<option key={option.id} value={option.id}>
											{option.label}
										</option>
									))}
								</S.ModalSelect>
								<S.ModalActions>
									<Button label="Cancel" type="default" onClick={handleCloseModal} />
									<Button label="Set" type="primary" onClick={handleSetCategory} disabled={!selectedCategory} />
								</S.ModalActions>
							</S.ModalContent>
						</S.ModalContainer>
					</S.ModalOverlay>
				</ModalPortal>
			)}
		</>
	);
}
