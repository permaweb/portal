import { CategoryList } from 'components/molecules/CategoryList';
import { TopicList } from 'components/molecules/TopicList';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';
import { IProps } from './types';

export default function ArticleToolbarPost(props: IProps) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper>
			<S.Section>
				<S.SectionHeader>
					<p>{language.categories}</p>
				</S.SectionHeader>
				<S.SectionBody>
					<CategoryList categories={props.categories} setCategories={props.setCategories} selectOnAdd />
				</S.SectionBody>
			</S.Section>
			<S.TopicsSection>
				<S.SectionHeader>
					<p>{language.topics}</p>
				</S.SectionHeader>
				<S.SectionBody>
					<TopicList topics={props.topics} setTopics={props.setTopics} selectOnAdd />
				</S.SectionBody>
			</S.TopicsSection>
		</S.Wrapper>
	);
}
