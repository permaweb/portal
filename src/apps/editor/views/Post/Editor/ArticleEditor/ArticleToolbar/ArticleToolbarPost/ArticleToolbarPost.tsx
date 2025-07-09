import { Categories } from 'editor/components/molecules/Categories';
import { Topics } from 'editor/components/molecules/Topics';

import { PortalCategoryType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ArticleToolbarPostContribute } from './ArticleToolbarPostContribute';
import { ArticleToolbarPostDescription } from './ArticleToolbarPostDescription';
import { ArticleToolbarPostThumbnail } from './ArticleToolbarPostThumbnail';
import * as S from './styles';

export default function ArticleToolbarPost(props: {
	categories: PortalCategoryType[];
	setCategories: (categories: PortalCategoryType[]) => void;
	topics: string[];
	setTopics: (topics: string[]) => void;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper>
			<S.Section>
				<S.SectionHeader>
					<p>{language.featuredImage}</p>
				</S.SectionHeader>
				<S.SectionBody>
					<ArticleToolbarPostThumbnail />
				</S.SectionBody>
			</S.Section>
			<S.Section>
				<S.SectionHeader>
					<p>{language.description}</p>
				</S.SectionHeader>
				<S.SectionBody>
					<ArticleToolbarPostDescription />
				</S.SectionBody>
			</S.Section>
			<S.Section>
				<S.SectionHeaderInput>
					<p>{language.categories}</p>
				</S.SectionHeaderInput>
				<S.SectionBody>
					<Categories categories={props.categories} setCategories={props.setCategories} selectOnAdd skipAuthCheck />
				</S.SectionBody>
			</S.Section>
			<S.TopicsSection>
				<S.SectionHeaderInput>
					<p>{language.topics}</p>
				</S.SectionHeaderInput>
				<S.SectionBody>
					<Topics topics={props.topics} setTopics={props.setTopics} selectOnAdd skipAuthCheck />
				</S.SectionBody>
			</S.TopicsSection>
			<S.ContributeSection>
				<S.SectionHeader>
					<p>{language.contribute}</p>
				</S.SectionHeader>
				<S.SectionBody>
					<ArticleToolbarPostContribute />
				</S.SectionBody>
			</S.ContributeSection>
		</S.Wrapper>
	);
}
