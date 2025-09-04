import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthors } from 'engine/hooks/posts';
import { useProfile } from 'engine/hooks/profiles';

import Title from 'components/title';

import * as S from './styles';

export default function SidebarAuthors() {
	const navigate = useNavigate();
	const { authors } = useAuthors();

	const Author = ({ userId }: { userId: string }) => {
		const { profile } = useProfile(userId);
		if (!profile) return null;

		return (
			<S.FNEntry $level={1} onClick={() => navigate(`/user/${userId}`)}>
				{profile?.displayName || userId}
			</S.FNEntry>
		);
	};

	return (
		<S.SidebarCategory>
			<h2>Authors</h2>
			<S.FNCategory>
				{authors.map((author, index) => (
					<Author key={author} userId={author} />
				))}
			</S.FNCategory>
		</S.SidebarCategory>
	);
}
