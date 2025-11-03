import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

export default function ModalPortal({ children }: { children: React.ReactNode }) {
	const el = useMemo(() => document.createElement('div'), []);
	useEffect(() => {
		document.body.appendChild(el);
		return () => {
			document.body.removeChild(el);
		};
	}, [el]);
	return createPortal(children, el);
}
