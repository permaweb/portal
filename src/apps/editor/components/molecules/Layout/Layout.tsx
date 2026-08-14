import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { ICONS } from 'helpers/config';
import { PortalPatchMapEnum } from 'helpers/types';
import { debugLog } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

type LayoutMode = 'blog' | 'docs';

function isScalarLayoutMode(value: unknown): value is LayoutMode {
	return value === 'blog' || value === 'docs';
}

function normalizeLayoutMode(value: unknown): LayoutMode {
	if (typeof value === 'string') {
		const normalized = value.toLowerCase();
		return normalized === 'docs' || normalized === 'documentation' ? 'docs' : 'blog';
	}
	if (!value || typeof value !== 'object') return 'blog';

	const legacyLayout = value as any;
	const position = legacyLayout?.navigation?.layout?.position ?? legacyLayout?.Navigation?.Layout?.Position;
	return position === 'left' || position === 'right' ? 'docs' : 'blog';
}

export default function Layout() {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

	const initialLayout = normalizeLayoutMode(portalProvider.current?.layout);
	const [layout, setLayout] = React.useState<LayoutMode>(initialLayout);
	const [originalLayout, setOriginalLayout] = React.useState<LayoutMode>(initialLayout);
	const [layoutStoredAsScalar, setLayoutStoredAsScalar] = React.useState(() =>
		isScalarLayoutMode(portalProvider.current?.layout)
	);
	const [loading, setLoading] = React.useState<boolean>(false);
	const hasUserSelected = React.useRef(false);

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;
	const hasChanges = originalLayout !== layout || !layoutStoredAsScalar;
	const options: { name: LayoutMode; icon: string }[] = [
		{ name: 'blog', icon: ICONS.layoutBlog },
		{ name: 'docs', icon: ICONS.layoutDocumentation },
	];

	React.useEffect(() => {
		if (hasUserSelected.current) return;
		const nextLayout = normalizeLayoutMode(portalProvider.current?.layout);
		setLayout(nextLayout);
		setOriginalLayout(nextLayout);
		setLayoutStoredAsScalar(isScalarLayoutMode(portalProvider.current?.layout));
	}, [portalProvider.current?.id, portalProvider.current?.layout]);

	function handleLayoutOptionChange(optionName: LayoutMode) {
		hasUserSelected.current = true;
		setLayout(optionName);
	}

	async function handleSave() {
		if (!arProvider.wallet || !portalProvider.current?.id || unauthorized) return;

		try {
			setLoading(true);
			const currentLayout = portalProvider.current.layout as any;
			const legacyPostPreviews = currentLayout?.postPreviews ?? currentLayout?.PostPreviews;
			const update: Record<string, any> = { Layout: layout };
			if (legacyPostPreviews && typeof legacyPostPreviews === 'object' && !Array.isArray(legacyPostPreviews)) {
				update.PostPreviews = permawebProvider.libs.mapToProcessCase({
					...legacyPostPreviews,
					...(portalProvider.current.postPreviews || {}),
				});
			}
			const layoutUpdateId = await permawebProvider.libs.updateZone(
				update,
				portalProvider.current.id,
				arProvider.wallet
			);

			setOriginalLayout(layout);
			setLayoutStoredAsScalar(true);
			hasUserSelected.current = false;
			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);

			debugLog('info', 'Layout', 'Layout update:', layoutUpdateId);
			addNotification(`${language?.layoutUpdated || 'Layout Updated'}!`, 'success');
		} catch (e: any) {
			addNotification(e.message ?? 'Error updating layout', 'warning');
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			{loading && <Loader message={`${language.updatingLayout}...`} />}
			<S.Wrapper>
				<S.OptionsWrapper>
					{options.map((option) => {
						const active = option.name === layout;

						return (
							<S.Option
								key={option.name}
								disabled={unauthorized}
								$active={active}
								onClick={() => (active ? undefined : handleLayoutOptionChange(option.name))}
							>
								<S.OptionIcon $active={active}>
									<img src={option.icon} alt={option.name} />
								</S.OptionIcon>
								<S.OptionLabel>{option.name}</S.OptionLabel>
							</S.Option>
						);
					})}
				</S.OptionsWrapper>
				<S.EndActions>
					<Button
						type={'alt1'}
						label={language?.save || 'Save'}
						handlePress={handleSave}
						loading={loading}
						disabled={loading || !hasChanges || unauthorized}
					/>
				</S.EndActions>
			</S.Wrapper>
		</>
	);
}
