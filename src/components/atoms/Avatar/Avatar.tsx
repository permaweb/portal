import React from 'react';
import { ReactSVG } from 'react-svg';

import { ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress } from 'helpers/utils';

import * as S from './styles';
import { IProps } from './types';

export default function Avatar(props: IProps) {
	const [hasError, setHasError] = React.useState(false);

	const hasImage = props.owner && props.owner.avatar && checkValidAddress(props.owner.avatar);

	const avatar = React.useMemo(() => {
		if (!hasError && props.owner && props.owner.avatar && checkValidAddress(props.owner.avatar)) {
			return <img src={getTxEndpoint(props.owner.avatar)} onError={() => setHasError(true)} />;
		} else return <ReactSVG src={ASSETS.user} />;
	}, [props.owner, hasError]);

	return (
		<S.Wrapper
			onClick={props.callback ? props.callback : () => {}}
			dimensions={props.dimensions}
			hasCallback={props.callback !== null}
			hasOwner={props.owner !== null}
			className={'fade-in'}
			hasImage={hasImage}
		>
			{avatar}
		</S.Wrapper>
	);
}
