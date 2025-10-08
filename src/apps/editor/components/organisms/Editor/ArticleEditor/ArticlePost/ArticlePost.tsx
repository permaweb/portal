import { Categories } from 'editor/components/molecules/Categories';
import { Topics } from 'editor/components/molecules/Topics';

import { PortalCategoryType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ArticlePostContribute } from './ArticlePostContribute';
import { ArticlePostCreator } from './ArticlePostCreator';
import { ArticlePostDescription } from './ArticlePostDescription';
import { ArticlePostReleaseDate } from './ArticlePostReleaseDate';
import { ArticlePostStatus } from './ArticlePostStatus';
import { ArticlePostThumbnail } from './ArticlePostThumbnail';
import { ArticlePostURL } from './ArticlePostURL';
import * as S from './styles';

export default function ArticlePost(props: {
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
					<p>{language?.featuredImage}</p>
				</S.SectionHeader>
				<S.SectionBody>
					<ArticlePostThumbnail />
				</S.SectionBody>
			</S.Section>
			<S.Section>
				<S.SectionHeader>
					<p>{language?.publication}</p>
				</S.SectionHeader>
				<S.SectionBody>
					<S.SectionStart>
						<ArticlePostCreator />
					</S.SectionStart>
					<ArticlePostReleaseDate />
					<ArticlePostStatus />
					<S.SectionEnd>
						<ArticlePostURL />
					</S.SectionEnd>
				</S.SectionBody>
			</S.Section>
			<S.Section>
				<S.SectionHeader>
					<p>{language?.description}</p>
				</S.SectionHeader>
				<S.SectionBody>
					<ArticlePostDescription />
				</S.SectionBody>
			</S.Section>
			<S.Section>
				<S.SectionHeaderInput>
					<p>{language?.categories}</p>
				</S.SectionHeaderInput>
				<S.SectionBody>
					<Categories categories={props.categories} setCategories={props.setCategories} selectOnAdd skipAuthCheck />
				</S.SectionBody>
			</S.Section>
			<S.TopicsSection>
				<S.SectionHeaderInput>
					<p>{language?.topics}</p>
				</S.SectionHeaderInput>
				<S.SectionBody>
					<Topics topics={props.topics} setTopics={props.setTopics} selectOnAdd skipAuthCheck />
				</S.SectionBody>
			</S.TopicsSection>
			<S.ContributeSection>
				<S.SectionHeader>
					<p>{language?.contribute}</p>
				</S.SectionHeader>
				<S.SectionBody>
					<S.SectionStart>
						<ArticlePostContribute />
					</S.SectionStart>
				</S.SectionBody>
			</S.ContributeSection>
		</S.Wrapper>
	);
}
