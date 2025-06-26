import { useDispatch, useSelector } from 'react-redux';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { Checkbox } from 'components/atoms/Checkbox';
import { PortalHeaderType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function ArticleToolbarPostContribute() {
	const dispatch = useDispatch();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	const externalPortals = portalProvider.portals?.filter(
		(portal: PortalHeaderType) => portal.id !== portalProvider.current?.id
	);

	function handleRecipientUpdate(portalId: string) {
		const recipients = currentPost.data?.externalRecipients ?? [];
		let updated: string[];

		if (recipients.includes(portalId)) {
			updated = recipients.filter((id: string) => id !== portalId);
		} else {
			updated = [...recipients, portalId];
		}

		handleCurrentPostUpdate({
			field: 'externalRecipients',
			value: updated,
		});
	}

	return (
		<S.Wrapper>
			{externalPortals?.length > 0 ? (
				<>
					{externalPortals.map((portal: PortalHeaderType) => {
						return (
							<S.PortalLine key={portal.id}>
								<S.Checkbox>
									<Checkbox
										checked={currentPost.data?.externalRecipients?.includes(portal.id)}
										handleSelect={() => handleRecipientUpdate(portal.id)}
										disabled={currentPost.editor?.loading?.active}
									/>
								</S.Checkbox>
								<span>{portal.name}</span>
							</S.PortalLine>
						);
					})}
				</>
			) : (
				<span>{language.noExternalPortals}</span>
			)}
		</S.Wrapper>
	);
}
