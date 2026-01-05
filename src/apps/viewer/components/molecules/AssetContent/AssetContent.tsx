import parse from 'html-react-parser';

import OdyseeEmbed from 'engine/builder/blocks/odyseeEmbed';
import { ArticleBlockType } from 'helpers/types';

import * as S from './styles';

export default function AssetContent(props: { content: ArticleBlockType[] }) {
	function getArticleBlock(block: ArticleBlockType) {
		let Element: any = null;

		switch (block.type) {
			case 'paragraph':
				Element = 'p';
				break;
			case 'quote':
				Element = 'blockquote';
				break;
			case 'ordered-list':
				Element = 'ol';
				break;
			case 'unordered-list':
				Element = 'ul';
				break;
			case 'code':
				Element = 'code';
				break;
			case 'header-1':
				Element = 'h1';
				break;
			case 'header-2':
				Element = 'h2';
				break;
			case 'header-3':
				Element = 'h3';
				break;
			case 'header-4':
				Element = 'h4';
				break;
			case 'header-5':
				Element = 'h5';
				break;
			case 'header-6':
				Element = 'h6';
				break;
			case 'odysee-embed':
				return <OdyseeEmbed key={block.id} element={block} />;
			default:
				Element = null;
				break;
		}

		if (Element)
			return (
				<Element key={block.id} className={'fade-in'}>
					{parse(block.content)}
				</Element>
			);
		return parse(block.content);
	}

	return props.content ? (
		<S.Wrapper>
			{props.content.map((block: ArticleBlockType) => {
				return getArticleBlock(block);
			})}
		</S.Wrapper>
	) : null;
}
