import React from 'react';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { ICONS } from 'helpers/config';
import { PortalDomainType, PortalPatchMapEnum } from 'helpers/types';
import { getCurrentGateway } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

function Domain(props: { domain: PortalDomainType }) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const { addNotification } = useNotifications();
	const languageProvider = useLanguageProvider();
	const language: any = languageProvider.object[languageProvider.current];

	const [showDropdown, setShowDropdown] = React.useState<boolean>(false);
	const [loading, setLoading] = React.useState<boolean>(false);

	async function handleSetPrimary() {
		if (portalProvider.permissions?.updatePortalMeta) {
			setLoading(true);
			try {
				const current = portalProvider.current?.domains ?? [];
				let next: PortalDomainType[];
				const hadName = current.some((d) => d.name === props.domain?.name);

				next = current.map<PortalDomainType>((d) =>
					d.name === props.domain?.name ? { name: props.domain?.name, primary: true } : { name: d.name }
				);

				if (!hadName) next.push({ name: props.domain?.name, primary: true });

				const domainUpdateId = await permawebProvider.libs.updateZone(
					{ Domains: permawebProvider.libs.mapToProcessCase(next) },
					portalProvider.current.id,
					arProvider.wallet
				);

				portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Navigation);

				console.log(`Domain update: ${domainUpdateId}`);
				addNotification(`${language.domainsUpdated}!`, 'success');
			} catch (e: any) {
				addNotification(e.message ?? 'Error updating domains', 'warning');
			}
			setLoading(false);
		}
	}

	const currentUrl = `https://${props.domain.name}.${getCurrentGateway()}`;

	return (
		<>
			{loading && <Loader message={`${language.updating}...`} />}
			<S.DomainWrapper>
				<Link to={currentUrl} target={'_blank'}>
					<S.DomainContent isOpen={false}>
						<S.DomainHeader>
							<S.DomainHeaderContent>
								<S.DomainName>{props.domain.name}</S.DomainName>
							</S.DomainHeaderContent>
						</S.DomainHeader>
						<S.DomainDetail>
							{props.domain?.primary && <S.DomainBadge>{language.primaryDomain}</S.DomainBadge>}
							<S.DomainActions>
								<IconButton
									type={'alt1'}
									active={false}
									src={ICONS.menu}
									handlePress={() => setShowDropdown((prev) => !prev)}
									disabled={false}
									dimensions={{ wrapper: 27.5, icon: 15 }}
									tooltip={showDropdown ? null : language?.showDomainActions}
									tooltipPosition={'bottom-right'}
									noFocus
								/>
							</S.DomainActions>
						</S.DomainDetail>
					</S.DomainContent>
				</Link>
				{showDropdown && (
					<CloseHandler active={showDropdown} disabled={!showDropdown} callback={() => setShowDropdown(false)}>
						<S.DomainActionsDropdown className={'border-wrapper-alt1 fade-in'}>
							<button
								onClick={(e: any) => {
									e.stopPropagation();
									window.open(currentUrl, '_blank');
								}}
							>
								<ReactSVG src={ICONS.site} />
								<p>{language.goToSite}</p>
							</button>
							{!props.domain?.primary && portalProvider.permissions?.updatePortalMeta && (
								<button
									onClick={(e: any) => {
										e.stopPropagation();
										handleSetPrimary();
										setShowDropdown(false);
									}}
								>
									<ReactSVG src={ICONS.domains} />
									<p>{language.setPrimaryDomain}</p>
								</button>
							)}
						</S.DomainActionsDropdown>
					</CloseHandler>
				)}
			</S.DomainWrapper>
		</>
	);
}

export default function DomainListPortal(props: { type: 'header' | 'detail' }) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language: any = languageProvider.object[languageProvider.current];

	function getDomains() {
		if (!portalProvider.current?.domains) {
			return (
				<S.LoadingWrapper>
					<p>{language.fetchingYourDomains}…</p>
				</S.LoadingWrapper>
			);
		} else if (portalProvider.current?.domains.length === 0) {
			return (
				<S.WrapperEmpty>
					<p>{language.noDomainsFound}</p>
				</S.WrapperEmpty>
			);
		} else {
			const sortedDomains = [...portalProvider.current.domains].sort((a, b) => {
				if (a.primary && !b.primary) return -1;
				if (!a.primary && b.primary) return 1;
				return 0;
			});
			return sortedDomains.map((domain: PortalDomainType, index: number) => {
				return <Domain key={index} domain={domain} />;
			});
		}
	}

	return (
		<S.Wrapper className={'fade-in'} type={props.type}>
			{getDomains()}
		</S.Wrapper>
	);
}
