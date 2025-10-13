import React from 'react';
import { useProfile } from 'engine/hooks/profiles';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { checkValidAddress } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

export const usePosts = (props?: any) => {
	const { portal } = usePortalProvider();
	const { profile: authorProfile } = useProfile(props?.author || null);
	const { profile: user } = usePermawebProvider();
	const Posts = portal?.Posts || [];
	const isLoading = false;
	const error = null;
	let filtered = Posts ? Object.values(Posts) : Posts;

	// Check if user is admin or moderator
	const canViewDrafts = user?.owner && user?.roles && ['Admin', 'Moderator'].some((r) => user.roles.includes(r));

	if (filtered) {
		filtered = filtered.filter((post) => {
			// Filter by asset type
			if (post.assetType !== 'blog-post') return false;

			// Filter out drafts for non-admin/non-moderator users
			if (post.metadata?.status === 'draft' && !canViewDrafts) return false;

			return true;
		});
	}

	if (props && filtered) {
		filtered = filtered.filter((post) => {
			const m = post.metadata ?? {};

			// Use the resolved profile ID instead of the username
			if (props.author && authorProfile?.id && post.creator !== authorProfile.id) return false;
			if (props.category && !m.categories?.some((c) => c.name === props.category || c.id === props.category))
				return false;
			if (props.tags && !props.tags.some((t: string) => post.metadata?.topics?.includes(t))) return false;
			// if (props.author && post.creator !== props.author) return false;
			// if (props.network && m.originPortal !== props.network) return false;
			if (props.date) {
				const ts = Number(m.releasedDate || post.dateCreated);
				if (!ts) return false;
				const d = new Date(ts);
				if (isNaN(d.getTime())) return false;
				if (d.getFullYear() !== props.date.year || d.getMonth() !== props.date.month - 1) return false;
			}
			if (props.search) {
				const haystack = [
					post.title,
					post.description,
					post.creator,
					m.topics?.join(' '),
					m.categories?.map((c) => `${c.name} ${c.id}`).join(' '),
					m.content?.map((c) => c.content).join(' '),
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();
				if (!haystack.includes(props.search.toLowerCase())) return false;
			}

			return true;
		});
	}

	if (filtered) {
		for (const post of filtered) {
			post.source = { author: post.creator };
			post.comments = [];
		}
	}

	let Title = undefined;
	if (props?.category && Array.isArray(filtered)) {
		for (const post of filtered) {
			const cats = post.metadata?.categories || [];
			for (const cat of cats) {
				if (cat.id === props.category || cat.name === props.category) {
					Title = cat.name;
					break;
				}
				for (const sub of cat.children || []) {
					if (sub.id === props.category || sub.name === props.category) {
						Title = sub.name;
						break;
					}
				}
				if (Title) break;
			}
			if (Title) break;
		}
	} else if (props?.tags && Array.isArray(filtered)) {
		for (const post of filtered) {
			const topics = post.metadata?.topics || [];
			for (const tag of props.tags) {
				if (topics.includes(tag)) {
					Title = `#${tag}`;
					break;
				}
			}
			if (Title) break;
		}
	} else if (props?.author) {
		Title = authorProfile?.displayName;
	}

	return {
		Posts: filtered,
		Title,
		isLoading: isLoading || !Posts,
		error,
	};
};

export const usePost = (id: any) => {
	const { libs } = usePermawebProvider();
	const { portal } = usePortalProvider();
	const { Posts } = portal;
	const [fullPost, setFullPost] = React.useState<any>(undefined);
	const [isLoading, setIsLoading] = React.useState(true);
	const [error, setError] = React.useState<any>(undefined);

	React.useEffect(() => {
		if (!id || !libs) {
			setIsLoading(!id ? false : true);
			return;
		}

		let postId = checkValidAddress(id) ? id : null;

		if (!postId && Posts && Array.isArray(Posts)) {
			const found = Posts.find((p) => p.metadata?.url === id);
			if (found) postId = found.id;
		}

		libs
			.getAtomicAsset(postId)
			.then((fetchedPost: any) => {
				setFullPost(fetchedPost);
				setIsLoading(false);
			})
			.catch((err: any) => {
				console.error('Error fetching post:', err);
				setError(err);
				setIsLoading(false);
			});
	}, [id, libs, checkValidAddress(id) ? null : Posts]);

	return {
		post: fullPost,
		isLoading,
		error,
	};
};

export const useArchive = (author: any) => {
	const { Posts, isLoading, error: postsError } = usePosts(author ? { author } : null);

	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];

	if (!Array.isArray(Posts) || Posts.length === 0) {
		return { archive: {}, isLoading, postsError };
	}

	const sortedPosts = Posts.slice().sort((a, b) => Number(a.dateCreated) - Number(b.dateCreated));

	const firstDate = new Date(Number(sortedPosts[0]?.dateCreated || 0));
	const lastDate = new Date(Number(sortedPosts[sortedPosts.length - 1]?.dateCreated || 0));
	const archive = {};

	let year = firstDate.getFullYear();
	let month = firstDate.getMonth();

	while (year < lastDate.getFullYear() || (year === lastDate.getFullYear() && month <= lastDate.getMonth())) {
		if (!archive[year]) archive[year] = {};
		archive[year][months[month]] = false;

		month++;
		if (month === 12) {
			month = 0;
			year++;
		}
	}

	for (const p of Posts) {
		const d = new Date(Number(p.dateCreated));
		const y = d.getFullYear();
		const m = months[d.getMonth()];
		if (archive[y]) archive[y][m] = true;
	}

	return { archive, isLoading, postsError };
};

export const useAuthors = () => {
	const { Posts, isLoading, error: postsError } = usePosts();
	const authors = Array.from(new Set(Posts && Posts.map((p) => p.creator)));

	return { authors, isLoading, postsError };
};
