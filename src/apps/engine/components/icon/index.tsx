// @flow
// import * as ICONS from 'constants/icons';
import React from 'react';

import { icons } from './icons';

type Props = {
	icon: string;
	tooltip?: boolean;
	customTooltipText?: string;
	iconColor?: string;
	size?: number;
	className?: string;
	sectionIcon?: boolean;
};

class Icon extends React.PureComponent<Props> {
	render() {
		const { icon, tooltip, customTooltipText, iconColor, size, className, sectionIcon = false, ...rest } = this.props;
		const Icon = icons[this.props.icon];

		if (!Icon) {
			return null;
		}

		let color;
		let tooltipText;

		const component = (
			<Icon
				title={tooltipText}
				size={size || (sectionIcon ? 20 : 16)}
				className={`icon icon--${icon}`}
				color={color}
				aria-hidden
				{...rest}
			/>
		);

		return sectionIcon ? <span className={`icon__wrapper icon__wrapper--${icon}`}>{component}</span> : component;
	}
}

export default Icon;
