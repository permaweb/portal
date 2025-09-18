import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { DomainListArNS } from 'editor/components/organisms/DomainListArNS';
import { DomainListPortal } from 'editor/components/organisms/DomainListPortal';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ASSETS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';
import { UndernameRequestList } from 'editor/components/organisms/UndernameRequestList';
import { UndernamesList } from 'editor/components/organisms/UndernamesList';
import { ClaimUndername } from 'editor/components/molecules/ClaimUndername';
import { AddController } from 'editor/components/molecules/AddController';

export default function Domains() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showAdditionalRecords, setShowAdditionalRecords] = React.useState(false);

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader
				header={language?.domains}
				actions={[
					<Button
						type={'primary'}
						label={showAdditionalRecords ? language.hideYourRecords : language.showYourRecords}
						handlePress={() => setShowAdditionalRecords((prev) => !prev)}
						disabled={false}
					/>,
					<Button
						type={'alt1'}
						label={language.registerDomain}
						handlePress={() => navigate(URLS.portalDomainsRegister(portalProvider.current?.id))}
						disabled={!portalProvider.permissions.updatePortalMeta}
						icon={ASSETS.domains}
						iconLeftAlign
					/>,
				]}
			/>
			<S.BodyWrapper>
				<S.DomainsWrapper className={'border-wrapper-alt2'}>
					<DomainListPortal type={'detail'} />
				</S.DomainsWrapper>

				{showAdditionalRecords && (
					<S.DomainsWrapper>
						<h6>Your Records</h6>
						<S.DomainsArNS className={'border-wrapper-alt2'}>
							<DomainListArNS />
						</S.DomainsArNS>
					</S.DomainsWrapper>
				)}
			</S.BodyWrapper>
			{!portalProvider.permissions?.updatePortalMeta && (
				<S.InfoWrapper className={'warning'}>
					<span>{language?.unauthorizedDomainManage}</span>
				</S.InfoWrapper>
			)}
			<ViewHeader header={language?.subdomains ?? 'Sub-Domains'} actions={[<ClaimUndername />, <AddController />]} />
			<S.SubdomainsWrapper className={'fade-in'}>
				<UndernamesList />
				<UndernameRequestList />
			</S.SubdomainsWrapper>
		</S.Wrapper>
	);
}
