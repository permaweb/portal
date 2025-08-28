import React from 'react';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { initThemes } from 'engine/helpers/themes';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { usePermawebProvider } from 'providers/PermawebProvider';

import Comment from './comment';
import CommentAdd from './commentAdd';
import * as S from './styles';

export default function Comments(props: any) {
	const { preview, commentsId } = props;
	const { portal } = usePortalProvider();
	const Themes = preview ? defaultThemes : portal?.Themes;
	const { libs } = usePermawebProvider();
	const [comments, setComments] = React.useState(null);

	React.useEffect(() => {
		if (preview) {
			initThemes(Themes);
			document.getElementById('preview')?.setAttribute('data-theme', 'dark');
		}
	}, []);

	React.useEffect(() => {
		(async function () {
			if (libs && commentsId) {
				try {
					const comments = await libs.getComments({ commentsId });
					setComments(comments);
				} catch (e) {
					console.error(e);
				}
			}
		})();
	}, [libs, commentsId]);

	return (
		<S.Comments>
			<h2>Comments</h2>
			<CommentAdd commentsId={commentsId}/>
			<S.CommentList>
				{comments &&
					comments.map((comment: any, index: string) => {
						return <Comment key={index} data={comment} level="0" commentsId={commentsId} />;
					})}
			</S.CommentList>
		</S.Comments>
	);
}
