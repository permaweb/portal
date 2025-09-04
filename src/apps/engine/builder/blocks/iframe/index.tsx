import GridItem from '../gridItem';
// import * as S from './styles';

export default function Iframe(props: any) {
	const { uri, width, height, title } = props;

	return (
		<GridItem title={title} width={width} height={height}>
			<iframe src={uri} />
		</GridItem>
	);
}
