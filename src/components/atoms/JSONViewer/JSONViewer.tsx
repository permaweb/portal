import React from 'react';
import * as S from './styles';

type RenderEntryProps = {
	data: any;
	level?: number;
};

function RenderEntry(props: RenderEntryProps) {
	const [open, setOpen] = React.useState(false);
	const indent = { marginLeft: (props.level ?? 0) * 16 };

	if (Array.isArray(props.data)) {
		return (
			<S.Row style={indent}>
				<S.Key>Array[{props.data.length}]</S.Key>
				<S.Toggle onClick={() => setOpen((o) => !o)}>{open ? 'collapse' : 'expand'}</S.Toggle>
				{open &&
					props.data.map((item: any, i: number) => (
						<S.ArrayItem key={i} first={i === 0}>
							<RenderEntry data={item} level={(props.level ?? 0) + 1} />
						</S.ArrayItem>
					))}
			</S.Row>
		);
	}

	if (typeof props.data === 'object' && props.data !== null) {
		return (
			<div style={indent}>
				{Object.entries(props.data).map(([k, v]) => (
					<S.Row key={k}>
						<S.Key>{k}:</S.Key>{' '}
						{typeof v === 'object' && v !== null ? (
							<RenderEntry data={v} level={(props.level ?? 0) + 1} />
						) : (
							<S.Value>{String(v)}</S.Value>
						)}
					</S.Row>
				))}
			</div>
		);
	}

	return (
		<S.Row style={indent}>
			<S.Value>{String(props.data)}</S.Value>
		</S.Row>
	);
}

export default function JSONViewer(props: { title?: string; data: any }) {
	return (
		<S.Container>
			{props.title ? (
				<S.Header>
					<S.Title>{props.title}</S.Title>
				</S.Header>
			) : null}
			<RenderEntry data={props.data} level={0} />
		</S.Container>
	);
}
