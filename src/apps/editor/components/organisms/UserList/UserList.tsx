import React from 'react';
import { useNavigate } from 'react-router-dom';

import { User } from 'editor/components/molecules/User';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { URLS } from 'helpers/config';
import { PortalUserType, ViewLayoutType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import * as S from './styles';

const PAGE_SIZE = 10;

export default function UserList(props: { type: ViewLayoutType }) {
	const navigate = useNavigate();

	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [currentPage, setCurrentPage] = React.useState(1);
	const [usersWithPendingInvites, setUsersWithPendingInvites] = React.useState<Set<string>>(new Set());

	const handleInviteDetected = React.useCallback((userAddress: string, hasPendingInvite: boolean) => {
		setUsersWithPendingInvites((prev) => {
			const newSet = new Set(prev);
			if (hasPendingInvite) {
				newSet.add(userAddress);
			} else {
				newSet.delete(userAddress);
			}
			return newSet;
		});
	}, []);

	const roleOrder = ['Admin', 'Moderator', 'Contributor', 'ExternalContributor'];

	const getRolePriority = (user: PortalUserType) => {
		if (!user.roles || user.roles.length === 0) return roleOrder.length;
		const highestRole = user.roles.find((role) => roleOrder.includes(role));
		return highestRole ? roleOrder.indexOf(highestRole) : roleOrder.length;
	};

	function getHeader() {
		switch (props.type) {
			case 'header':
				return (
					<S.UsersHeaderDetails className={'border-wrapper-alt3'}>
						<p>{language?.users}</p>
						<S.PostsHeaderDetailsActions>
							<Button
								type={'alt3'}
								label={language?.usersLink}
								handlePress={() => navigate(URLS.portalUsers(portalProvider.current.id))}
							/>
						</S.PostsHeaderDetailsActions>
					</S.UsersHeaderDetails>
				);
			case 'detail':
				return null;
			default:
				return null;
		}
	}

	// Build the full (filtered + sorted) list once
	const processedUsers = React.useMemo<PortalUserType[]>(() => {
		const users = portalProvider.current?.users ?? [];
		if (users.length === 0) return [];

		return users
			.filter((user) => user.type === 'process')
			.sort((a, b) => {
				// current user first
				if (a.address === permawebProvider.profile?.id) return -1;
				if (b.address === permawebProvider.profile?.id) return 1;

				// then by role priority
				const aRolePriority = getRolePriority(a);
				const bRolePriority = getRolePriority(b);
				return aRolePriority - bRolePriority;
			});
	}, [portalProvider.current?.users, permawebProvider.profile?.id]);

	// Re-clamp the current page when the data changes
	const totalPages = React.useMemo(
		() => Math.max(1, Math.ceil(processedUsers.length / PAGE_SIZE)),
		[processedUsers.length]
	);

	React.useEffect(() => {
		setCurrentPage((prev) => {
			if (prev > totalPages) return totalPages;
			if (prev < 1) return 1;
			return prev;
		});
	}, [totalPages]);

	// Page slice + range
	const startIndex = (currentPage - 1) * PAGE_SIZE;
	const endIndexExclusive = Math.min(startIndex + PAGE_SIZE, processedUsers.length);
	const pageUsers = React.useMemo(
		() => processedUsers.slice(startIndex, endIndexExclusive),
		[processedUsers, startIndex, endIndexExclusive]
	);

	const currentRange = React.useMemo(
		() => ({
			start: processedUsers.length > 0 ? startIndex + 1 : 0,
			end: processedUsers.length > 0 ? endIndexExclusive : 0,
			total: processedUsers.length,
		}),
		[processedUsers.length, startIndex, endIndexExclusive]
	);

	const users = React.useMemo(() => {
		if (!portalProvider.current?.users) {
			return (
				<S.LoadingWrapper type={props.type}>
					<p>{`${language?.gettingUsers}...`}</p>
				</S.LoadingWrapper>
			);
		}

		if (processedUsers.length === 0) {
			return (
				<S.WrapperEmpty type={props.type}>
					<p>{language?.noUsersFound}</p>
				</S.WrapperEmpty>
			);
		}

		return portalProvider.current?.id ? (
			<S.UsersWrapper type={props.type}>
				{pageUsers.map((user: PortalUserType) => (
					<S.UserWrapper key={user.address}>
						<User user={user} onInviteDetected={handleInviteDetected} />
					</S.UserWrapper>
				))}
			</S.UsersWrapper>
		) : null;
	}, [
		props.type,
		language,
		portalProvider.current?.id,
		portalProvider.current?.users,
		processedUsers.length,
		pageUsers,
		handleInviteDetected,
		usersWithPendingInvites, // kept in deps in case UI reacts to this later
	]);

	return (
		<S.Wrapper>
			{getHeader()}
			{users}
			<S.UsersFooter>
				<S.UsersFooterDetail>
					<p>
						{language?.showingRange(
							currentRange.total > 0 ? currentRange.start : 0,
							currentRange.end,
							currentRange.total
						)}
					</p>
					<p>{`${language?.page} ${currentPage}`}</p>
				</S.UsersFooterDetail>
				<S.UsersFooterActions>
					<Button
						type={'alt3'}
						label={language?.previous}
						handlePress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
						disabled={currentPage === 1 || processedUsers.length === 0}
					/>
					<Button
						type={'alt3'}
						label={language?.next}
						handlePress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
						disabled={currentPage === totalPages || processedUsers.length === 0}
					/>
				</S.UsersFooterActions>
			</S.UsersFooter>{' '}
		</S.Wrapper>
	);
}
