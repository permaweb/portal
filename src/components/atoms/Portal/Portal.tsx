import React from 'react';
import ReactDOM from 'react-dom';

export default function Portal(props: { children: React.ReactNode; node: string }) {
	const [DOM, setDOM] = React.useState<boolean>(false);

	React.useEffect(() => {
		setDOM(true);
	}, []);

	return DOM && document.getElementById(props.node)
		? ReactDOM.createPortal(props.children, document.getElementById(props.node)!)
		: null;
}
