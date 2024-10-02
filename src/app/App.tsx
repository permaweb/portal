import React, { lazy, Suspense } from 'react';
import { debounce } from 'lodash';

import { DOM, STYLING } from 'helpers/config';
import { checkWindowCutoff } from 'helpers/window';
import { Navigation } from 'navigation/Navigation';

import * as S from './styles';

const Routes = lazy(() =>
	import(`../routes/Routes.tsx` as any).then((module) => ({
		default: module.default,
	}))
);

// TODO: Connected view / onboarding
export default function App() {
	const [navigationOpen, setNavigationOpen] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));
	const [_desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));

	function handleWindowResize() {
		if (checkWindowCutoff(parseInt(STYLING.cutoffs.desktop))) {
			setDesktop(true);
			setNavigationOpen(navigationOpen);
		} else {
			setDesktop(false);
			setNavigationOpen(false);
		}
	}

	const debouncedResize = React.useCallback(debounce(handleWindowResize, 0), [navigationOpen]);

	React.useEffect(() => {
		window.addEventListener('resize', debouncedResize);

		return () => {
			window.removeEventListener('resize', debouncedResize);
		};
	}, [debouncedResize]);

	return (
		<>
			<div id={DOM.loader} />
			<div id={DOM.notification} />
			<div id={DOM.overlay} />
			<Suspense fallback={null}>
				<S.AppWrapper>
					<Navigation open={navigationOpen} toggle={() => setNavigationOpen(!navigationOpen)} />
					<S.View navigationOpen={navigationOpen}>
						<Routes />
					</S.View>
				</S.AppWrapper>
			</Suspense>
		</>
	);
}
