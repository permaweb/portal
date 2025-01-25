import React from 'react';
import { useNavigate } from 'react-router-dom';

export function useNavigationConfirm(url: string, message: string) {
	const navigate = useNavigate();

	React.useEffect(() => {
		if (process.env.NODE_ENV === 'development') return;

		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = '';
		};

		const regex = new RegExp(`\\/${url}(\\/|$)`);

		if (regex.test(window.location.href)) {
			window.addEventListener('beforeunload', handleBeforeUnload);
		} else {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		}

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [url]);

	const confirmNavigation = (to: string) => {
		if (process.env.NODE_ENV === 'development') {
			navigate(to);
			return;
		}

		const regex = new RegExp(`\\/${url}(\\/|$)`);

		if (regex.test(window.location.href)) {
			console.log(window.location.href);
			if (window.confirm(message)) {
				navigate(to);
			}
		} else {
			navigate(to);
		}
	};

	return { confirmNavigation };
}
