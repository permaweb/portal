import React from 'react';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalUploadType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';
import { IProps } from './types';

// TODO: Media tabs
// TODO: Filter by type
// TODO: Upload / delete option
export default function MediaLibrary(props: IProps) {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [selectedUpload, setSelectedUpload] = React.useState<PortalUploadType | null>(null);

	if (!portalProvider.current?.uploads) {
		return (
			<S.LoadingWrapper>
				<p>{`${language.gettingUploads}...`}</p>
			</S.LoadingWrapper>
		);
	} else if (portalProvider.current?.uploads.length === 0) {
		return (
			<S.WrapperEmpty>
				<p>{language.noUploadsFound}</p>
			</S.WrapperEmpty>
		);
	}

	function getUpload(upload: PortalUploadType) {
		switch (upload.type) {
			case 'image':
				return <img src={getTxEndpoint(upload.tx)} />;
			case 'video':
				return <video controls src={getTxEndpoint(upload.tx)} />;
		}
	}

	return (
		<S.Wrapper>
			<S.Header>
				<p>{props.type === 'all' ? language.uploads : `${props.type}s`}</p>
				<S.HeaderActions>
					<Button
						type={'alt3'}
						label={language.delete}
						handlePress={() => {}}
						disabled={false}
						loading={false}
						icon={ASSETS.delete}
						iconLeftAlign
						warning
					/>
					<Button
						type={'alt4'}
						label={language.add}
						handlePress={() => {}}
						disabled={false}
						loading={false}
						icon={ASSETS.add}
						iconLeftAlign
					/>
				</S.HeaderActions>
			</S.Header>
			<S.UploadsWrapper>
				{portalProvider.current.uploads.map((upload: PortalUploadType) => {
					const active = selectedUpload?.tx === upload.tx;

					return (
						<S.UploadWrapper key={upload.tx} active={active} onClick={() => setSelectedUpload(active ? null : upload)}>
							{getUpload(upload)}
							{active && (
								<S.Indicator>
									<ReactSVG src={ASSETS.checkmark} />
								</S.Indicator>
							)}
						</S.UploadWrapper>
					);
				})}
			</S.UploadsWrapper>
			{(props.callback || props.handleClose) && (
				<S.ActionsWrapper>
					{props.handleClose && (
						<Button type={'primary'} label={language.close} handlePress={() => props.handleClose()} />
					)}
					{props.callback && (
						<Button
							type={'alt1'}
							label={language.select}
							handlePress={() => props.callback(selectedUpload)}
							disabled={!selectedUpload}
						/>
					)}
				</S.ActionsWrapper>
			)}
		</S.Wrapper>
	);
}
