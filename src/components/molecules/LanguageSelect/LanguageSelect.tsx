import { Select } from 'components/atoms/Select';
import { ASSETS } from 'helpers/config';
import { LanguageEnum, SelectOptionType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

export default function LanguageSelect() {
	const languageProvider = useLanguageProvider();

	const options = Object.keys(LanguageEnum).map((key) => ({ id: key, label: LanguageEnum[key] }))

	function handleLanguageChange(option: SelectOptionType) {
		languageProvider.setCurrent(option.id as any);
	}

	return (
		<Select
			activeOption={options.find((option) => option.id === languageProvider.current)}
			options={options}
			setActiveOption={(option: SelectOptionType) => handleLanguageChange(option)}
			disabled={false}
			hideActiveOption
			icon={ASSETS.language}
		/>
	);
}
