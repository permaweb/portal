export interface IProps {
	label: string;
	options: string[];
	activeOption: string;
	handleToggle: (option: string) => void;
	disabled: boolean;
}