import React from 'react';

import * as S from './styles';

type AccordionProps = {
	title: React.ReactNode;
	renderActions?: (args: { expanded: boolean; toggle: () => void }) => React.ReactNode;
	children?: React.ReactNode;
	defaultExpanded?: boolean;
	expanded?: boolean;
	onExpandedChange?: (open: boolean) => void;
	showTopDivider?: boolean;
};

export default function Accordion(props: AccordionProps) {
	const internalId = React.useId();
	const contentId = `${internalId}-content`;

	const isControlled = typeof props.expanded === 'boolean';
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(props.defaultExpanded);
	const open = isControlled ? (props.expanded as boolean) : uncontrolledOpen;

	const setOpen = React.useCallback(
		(v: boolean) => {
			if (!isControlled) setUncontrolledOpen(v);
			props.onExpandedChange?.(v);
		},
		[isControlled, props.onExpandedChange]
	);

	const toggle = React.useCallback(() => setOpen(!open), [open, setOpen]);

	return (
		<S.ERoot data-divided={props.showTopDivider}>
			<S.ERow>
				<S.ETitle>{props.title}</S.ETitle>
				<S.EActions>{props.renderActions?.({ expanded: open, toggle })}</S.EActions>
			</S.ERow>

			<S.EAccordion id={contentId} data-expanded={open} isOpen={open}>
				<S.EAccordionInner>{props.children}</S.EAccordionInner>
			</S.EAccordion>
		</S.ERoot>
	);
}
