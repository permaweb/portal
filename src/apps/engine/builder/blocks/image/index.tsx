import GridItem from '../gridItem';
// import * as S from './styles';

export default function Image(props: any) {
	const { uri, width, title } = props;

	return (
		<GridItem title={title} width={width}>
			<img src={uri} />
		</GridItem>
	);
}
