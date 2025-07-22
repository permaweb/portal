import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { ASSETS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Domains() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [searchValue, setSearchValue] = React.useState<string>('');
	const [isSearching, setIsSearching] = React.useState<boolean>(false);
	const [availabilityStatus, setAvailabilityStatus] = React.useState<'available' | 'unavailable' | null>(null);

	// Debounced API call for domain availability
	React.useEffect(() => {
		if (!searchValue.trim()) {
			setIsSearching(false);
			setAvailabilityStatus(null);
			return;
		}

		setIsSearching(true);
		setAvailabilityStatus(null);

		const timeoutId = setTimeout(async () => {
			try {
				// Mock API call - replace with actual API endpoint
				const response = await mockCheckDomainAvailability(searchValue.trim());
				setAvailabilityStatus(response.available ? 'available' : 'unavailable');
			} catch (error) {
				console.error('Error checking domain availability:', error);
				setAvailabilityStatus(null);
			} finally {
				setIsSearching(false);
			}
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [searchValue]);

	// Mock API function
	const mockCheckDomainAvailability = async (domain: string): Promise<{ available: boolean }> => {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 800));

		// Mock logic: domains starting with 'test' are unavailable
		const isAvailable = !domain.toLowerCase().startsWith('test');

		return { available: isAvailable };
	};

	const validateDomainName = React.useMemo(() => {
		if (!searchValue.trim()) {
			return {
				dashes: null,
				maxChars: null,
				wwwName: null,
				specialChars: null,
				available: null,
			};
		}

		const trimmedValue = searchValue.trim();

		const hasLeadingOrTrailingDashes = trimmedValue.startsWith('-') || trimmedValue.endsWith('-');
		const exceedsMaxChars = trimmedValue.length > 51;
		const isWwwName = trimmedValue.toLowerCase() === 'www';
		const hasSpecialChars = !/^[a-zA-Z0-9-]+$/.test(trimmedValue);

		return {
			dashes: hasLeadingOrTrailingDashes ? 'invalid' : 'valid',
			maxChars: exceedsMaxChars ? 'invalid' : 'valid',
			wwwName: isWwwName ? 'invalid' : 'valid',
			specialChars: hasSpecialChars ? 'invalid' : 'valid',
		};
	}, [searchValue]);

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader
				header={language?.domainRegistration}
				actions={[
					<Button type={'primary'} label={language?.goBack} link={URLS.portalDomains(portalProvider.current?.id)} />,
				]}
			/>
			<S.BodyWrapper>
				<S.SectionWrapper>
					<S.SectionHeader>
						<p>Step 1: Find a name</p>
						<S.SectionDivider />
					</S.SectionHeader>
					<S.SectionBody>
						<S.SearchWrapper>
							<S.SearchInputWrapper>
								<ReactSVG src={ASSETS.search} />
								<FormField
									value={searchValue}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
									placeholder={language.domainName}
									invalid={{ status: false, message: null }}
									disabled={isSearching}
									hideErrorMessage
									sm
								/>
							</S.SearchInputWrapper>
							{isSearching && (
								<S.UpdateWrapper className={'border-wrapper-alt3'}>
									<p>Searching...</p>
								</S.UpdateWrapper>
							)}
						</S.SearchWrapper>
						<S.IndicatorWrapper>
							<S.IndicatorLine>
								<S.Indicator status={validateDomainName.maxChars}>
									{validateDomainName.maxChars && (
										<ReactSVG src={validateDomainName.maxChars === 'valid' ? ASSETS.success : ASSETS.warning} />
									)}
								</S.Indicator>
								<span>{language.arnsMaxCharsValidation}</span>
							</S.IndicatorLine>
							<S.IndicatorLine>
								<S.Indicator status={validateDomainName.specialChars}>
									{validateDomainName.specialChars && (
										<ReactSVG src={validateDomainName.specialChars === 'valid' ? ASSETS.success : ASSETS.warning} />
									)}
								</S.Indicator>
								<span>{language.arnsSpecialCharsValidation}</span>
							</S.IndicatorLine>
							<S.IndicatorLine>
								<S.Indicator status={validateDomainName.dashes}>
									{validateDomainName.dashes && (
										<ReactSVG src={validateDomainName.dashes === 'valid' ? ASSETS.success : ASSETS.warning} />
									)}
								</S.Indicator>
								<span>{language.arnsDashesValidation}</span>
							</S.IndicatorLine>
							<S.IndicatorLine>
								<S.Indicator status={validateDomainName.wwwName}>
									{validateDomainName.wwwName && (
										<ReactSVG src={validateDomainName.wwwName === 'valid' ? ASSETS.success : ASSETS.warning} />
									)}
								</S.Indicator>
								<span>{language.arnsNameValidation}</span>
							</S.IndicatorLine>
							<S.SectionDivider />
							<S.IndicatorLine>
								<S.Indicator
									status={
										availabilityStatus === 'available'
											? 'valid'
											: availabilityStatus === 'unavailable'
											? 'invalid'
											: null
									}
								>
									{availabilityStatus && (
										<ReactSVG src={availabilityStatus === 'available' ? ASSETS.success : ASSETS.warning} />
									)}
								</S.Indicator>
								<span>{language.available}</span>
							</S.IndicatorLine>
						</S.IndicatorWrapper>
						<S.ActionsWrapper>
							<Button
								type={'primary'}
								label={language.clear}
								handlePress={() => setSearchValue('')}
								disabled={!searchValue}
							/>
							<Button type={'alt1'} label={language.continue} handlePress={() => {}} disabled={true} />
						</S.ActionsWrapper>
					</S.SectionBody>
				</S.SectionWrapper>
				<S.SectionWrapper>
					<S.SectionHeader>
						<p>Step 2: Registration Period</p>
						<S.SectionDivider />
					</S.SectionHeader>
					<S.SectionBody></S.SectionBody>
				</S.SectionWrapper>
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
