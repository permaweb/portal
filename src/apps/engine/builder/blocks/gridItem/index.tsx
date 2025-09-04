import Title from 'engine/components/title';

import * as S from './styles';

export default function GridItem(props: any) {
	const { title, width, height, children } = props;

	return (
		<S.GridItem $width={width} $height={height} id="GridItem">
			{title && (
				<Title>
					<h2>{title}</h2>
				</Title>
			)}
			{children}
		</S.GridItem>
	);
}
