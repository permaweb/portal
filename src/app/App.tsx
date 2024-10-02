import React, { lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';

import { readHandler } from 'api';

import { AO, ASSETS, DOM } from 'helpers/config';
import { Navigation } from 'navigation/Navigation';
import { RootState } from 'store';

import * as S from './styles';

const Routes = lazy(() =>
	import(`../routes/Routes.tsx` as any).then((module) => ({
		default: module.default,
	}))
);

export default function App() {
	const [navigationOpen, setNavigationOpen] = React.useState<boolean>(true);

	return (
		<>
			<div id={DOM.loader} />
			<div id={DOM.notification} />
			<div id={DOM.overlay} />
			{true ? (
				<Suspense fallback={null}>
					<S.AppWrapper>
						<Navigation open={navigationOpen} toggle={() => setNavigationOpen(!navigationOpen)} />
						<S.View navigationOpen={navigationOpen}>
							{/* <Routes /> */}
							<S.ViewContainer>
								
							</S.ViewContainer>
						</S.View>
					</S.AppWrapper>
				</Suspense>
			) : (
				<div className={'app-loader'}>
					<ReactSVG src={ASSETS.logo} />
				</div>
			)}
		</>
	);
}
