import { en } from './language/en';

export type LanguageKeys = keyof typeof en;
export type LanguageTranslations = typeof en;

function createLanguageWithFallback(translations: Partial<LanguageTranslations>): LanguageTranslations {
	return new Proxy(translations as LanguageTranslations, {
		get(target, prop: string | symbol) {
			if (typeof prop === 'string' && prop in target) {
				return target[prop as LanguageKeys];
			}
			if (typeof prop === 'string' && prop in en) {
				return en[prop as LanguageKeys];
			}
			return undefined;
		},
	});
}

export enum LanguageEnum {
	en = 'English',
	es = 'Español',
	de = 'Deutsch',
}

const languageCache: { [key: string]: LanguageTranslations } = {
	en,
};

export function loadLanguage(lang: string): LanguageTranslations {
	if (languageCache[lang]) {
		return languageCache[lang];
	}

	return en;
}

export async function loadLanguageAsync(lang: string): Promise<LanguageTranslations> {
	if (languageCache[lang]) {
		return languageCache[lang];
	}

	let translations: Partial<LanguageTranslations>;

	switch (lang) {
		case 'es':
			translations = (await import('./language/es')).es;
			break;
		case 'de':
			translations = (await import('./language/de')).de;
			break;
		default:
			return en;
	}

	const languageWithFallback = createLanguageWithFallback(translations);
	languageCache[lang] = languageWithFallback;
	return languageWithFallback;
}
