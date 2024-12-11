import React from 'react';

export interface IProps {
	header: string | null | undefined | React.ReactNode;
	handleClose: () => void | null;
	children: React.ReactNode;
	open: boolean;
	width?: number;
	closeHandlerDisabled?: boolean;
}
