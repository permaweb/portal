import { NavLink } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { ICONS } from 'helpers/config';

import * as S from './styles';

export default function CategoryReel(props: any) {
	const { homepageData, homepageOrder, authenticated, doSetClientSetting } = props;
	const { featured, categories } = homepageData;
	const [marginLeft, setMarginLeft] = React.useState(0);
	const [width, setWidth] = React.useState(0);
	const [index, setIndex] = React.useState(1);
	const [pause, setPause] = React.useState(false);
	const [kill, setKill] = React.useState(false);
	const wrapper = React.useRef(null);
	const imageWidth = width >= 1600 ? 1700 : width >= 1150 ? 1150 : width >= 900 ? 900 : width >= 600 ? 600 : 400;

	return (
		<div
			className={classnames('featured-banner-wrapper', { kill: kill })}
			ref={wrapper}
			onMouseEnter={() => setPause(true)}
			onMouseLeave={() => setPause(false)}
		>
			<div className="featured-banner-rotator" style={{ marginLeft: marginLeft }}>
				{featured &&
					featured.items.map((item, i) => {
						return (
							<NavLink
								className="featured-banner-image"
								onClick={(e) => handleAnchor(e, item.url)}
								to={getUriTo(item.url)}
								target={!item.url.includes('odysee.com') ? '_blank' : undefined}
								title={item.label}
								key={i}
								style={{ minWidth: width }}
							>
								<img
									src={'https://thumbnails.odycdn.com/optimize/s:' + imageWidth + ':0/quality:95/plain/' + item.image}
									style={{ width: width }}
								/>
							</NavLink>
						);
					})}
			</div>
			<div className="banner-controls">
				<div className="banner-browse left" onClick={() => setIndex(index > 1 ? index - 1 : featured.items.length)}>
					‹
				</div>
				<div className="banner-browse right" onClick={() => setIndex(index < featured.items.length ? index + 1 : 1)}>
					›
				</div>
				<div className="banner-active-indicator">
					{featured &&
						featured.items.map((item, i) => {
							return (
								<div
									key={i}
									className={i + 1 === index ? 'banner-active-indicator-active' : ''}
									onClick={() => setIndex(i + 1)}
								/>
							);
						})}
				</div>
				{authenticated && (
					<div className="featured-banner-remove" onClick={() => removeBanner()}>
						<ReactSVG src={ICONS.remove} />
					</div>
				)}
			</div>
		</div>
	);
}
