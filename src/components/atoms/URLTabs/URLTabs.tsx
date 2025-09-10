import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import * as S from './styles';

type URLViewType = {
	label: string;
	disabled: boolean;
	url: any;
	icon?: string;
	view: React.ComponentType;
};

function Tab(props: {
	label: string;
	icon: string | null;
	disabled: boolean;
	active: boolean;
	handlePress: (url: string) => void;
	url: string;
}) {
	function handlePress(e: any) {
		e.preventDefault();
		props.handlePress(props.url);
	}

	return (
		<S.Tab active={props.active}>
			<button onClick={handlePress}>{props.label}</button>
		</S.Tab>
	);
}

function TabContent(props: { tabs: URLViewType[] }) {
	const { id, active } = useParams() as { id: string; active: string };

	let TabView: React.ComponentType<any> | null = null;
	for (let i = 0; i < props.tabs.length; i++) {
		const url = typeof props.tabs[i].url === 'function' ? props.tabs[i].url(id) : props.tabs[i].url;
		if (url.includes(active)) {
			TabView = props.tabs[i].view;
			break;
		}
	}

	return <S.View>{TabView && <TabView />}</S.View>;
}

export default function URLTabs(props: { tabs: URLViewType[]; activeUrl: string; useFixed?: boolean }) {
	const navigate = useNavigate();
	const { id, active } = useParams() as { id: string; active: string };

	React.useEffect(() => {
		if (!active) {
			navigate(props.activeUrl);
		}
	}, [active, navigate, props.activeUrl, props.tabs]);

	const handleRedirect = (url: string) => {
		if (active !== url) {
			navigate(url);
		}
	};

	return (
		<S.Wrapper>
			<S.TabsHeader useFixed={props.useFixed ? props.useFixed : false}>
				<S.Tabs>
					{props.tabs.map((elem, index) => {
						const url = typeof elem.url === 'function' ? elem.url(id) : elem.url;
						return (
							<Tab
								key={index}
								url={url}
								label={elem.label}
								icon={elem.icon}
								disabled={elem.disabled}
								active={url.includes(active)}
								handlePress={() => handleRedirect(url)}
							/>
						);
					})}
				</S.Tabs>
			</S.TabsHeader>
			<S.Content>
				<TabContent tabs={props.tabs} />
			</S.Content>
		</S.Wrapper>
	);
}
