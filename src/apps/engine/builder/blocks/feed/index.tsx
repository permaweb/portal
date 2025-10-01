import React from 'react';
import { useParams } from 'react-router-dom';
import { usePosts } from 'engine/hooks/posts';
import { usePortalProvider } from 'engine/providers/portalProvider';

import PostPreview from './postPreview';
import * as S from './styles';

export default function Feed(props?: any) {
	const { preview } = props;
	const params = useParams();
	const { portal } = usePortalProvider();
	const Name = portal?.Name;
	const hasFilters =
		params.category || props.category || params.tag || params.author || params.user || params.search || params.year;
	const filters = hasFilters
		? {
				category: params.category ?? props.category ?? null,
				tags: params.tag ? [params.tag] : null,
				author: params.author ?? params.user ?? null,
				search: params.search ?? null,
				date: params.year ? { year: +params.year, month: +params.month } : null,
		  }
		: { preview };
	const { Posts, Title } = usePosts(filters);

	React.useEffect(() => {
		if (Title) {
			// @ts-ignore
			document.title = `${Title} - ${Name}`;
		}
	}, [Title]);

	return (
		<S.Feed width={props?.width}>
			{params.search && (
				<S.FeedHeader>
					<span>Search results</span>
					<h1>{params.search}</h1>
					<p>{Posts ? Posts.length : 0} posts</p>
				</S.FeedHeader>
			)}
			{Posts ? (
				Object.keys(Posts).map((key) => (
					<PostPreview key={Posts[key].id || key} post={Posts[key]} layout={props?.layout} />
				))
			) : (
				<>
					<PostPreview loading key={0} />
					<PostPreview loading key={1} />
					<PostPreview loading key={2} />
				</>
			)}
		</S.Feed>
	);
}
