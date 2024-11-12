import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';
import { IProps } from './types';

export default function PortalSetup(props: IProps) {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const links = [
		{ id: 'facebook', href: '#' },
		{ id: 'twitter', href: '#' },
		{ id: 'youtube', href: '#' },
		{ id: 'odysee', href: '#' },
	];

	return (
		<S.Wrapper>
			<S.Section>
				<S.SectionHeader>
					<p>Post Topics (11)</p>
					<IconButton
						type={'primary'}
						active={false}
						src={ASSETS.write}
						handlePress={() => console.log('Edit post topics')}
						dimensions={{ wrapper: 23.5, icon: 13.5 }}
						tooltip={language.editPostTopics}
						tooltipPosition={'bottom-right'}
						noFocus
					/>
				</S.SectionHeader>
			</S.Section>
			<S.DividerSection />
			<S.Section>
				<S.SectionHeader>
					<p>Site Categories (6)</p>
					<IconButton
						type={'primary'}
						active={false}
						src={ASSETS.write}
						handlePress={() => console.log('Edit site categories')}
						dimensions={{ wrapper: 23.5, icon: 13.5 }}
						tooltip={language.editSiteCategories}
						tooltipPosition={'bottom-right'}
						noFocus
					/>
				</S.SectionHeader>
			</S.Section>
			<S.Section>
				<S.SectionHeader>
					<p>Site Links (4)</p>
					<IconButton
						type={'primary'}
						active={false}
						src={ASSETS.write}
						handlePress={() => console.log('Edit site categories')}
						dimensions={{ wrapper: 23.5, icon: 13.5 }}
						tooltip={language.editSiteLinks}
						tooltipPosition={'bottom-right'}
						noFocus
					/>
				</S.SectionHeader>
				<S.LinksSection>
					{links?.length > 0 && (
						<>
							{links.map((link: any) => {
								return (
									<S.LinkWrapper>
										<a href={link.href} target={'_blank'}></a>
									</S.LinkWrapper>
								);
							})}
						</>
					)}
					<S.LinkWrapper>
						<button>
							<ReactSVG src={ASSETS.add} />
						</button>
					</S.LinkWrapper>
				</S.LinksSection>
			</S.Section>
		</S.Wrapper>
	);
}
