export interface IProps {
	topics: string[];
	setTopics: (topics: string[]) => void;
	selectOnAdd?: boolean;
	showActions?: boolean;
	closeAction?: () => void;
}
