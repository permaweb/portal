import React from 'react';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function DomainList() {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const domains = React.useMemo(() => {
		if (!portalProvider.current?.domains) {
			return (
				<S.LoadingWrapper>
					<p>{`${language?.gettingDomains}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (portalProvider.current?.domains.length === 0) {
			return (
				<S.WrapperEmpty>
					<p>{language?.noDomainsFound}</p>
				</S.WrapperEmpty>
			);
		}

		return portalProvider.current?.id ? (
			<S.Wrapper>
				{portalProvider.current.domains.map((domain: string) => {
					return (
						<S.DomainWrapper key={domain} className={'fade-in'}>
							<S.DomainHeader>
								<Link to={`https://${domain}.arweave.net`} target={'_blank'}>
									<p>{domain}</p>
									<ReactSVG src={ASSETS.newTab} />
								</Link>
							</S.DomainHeader>
							<S.DomainDetail>
								<S.DomainActions>
									<Button
										type={'alt3'}
										label={language?.viewInfo}
										handlePress={() => window.open(`https://arweave.net/${domain}`, 'blank')}
									/>
								</S.DomainActions>
							</S.DomainDetail>
						</S.DomainWrapper>
					);
				})}
			</S.Wrapper>
		) : null;
	}, [portalProvider.current?.id, portalProvider.current?.domains, language?.current]);

	return domains;
}
