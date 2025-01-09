export interface IProps {
	owner: any;
	dimensions: {
		wrapper: number;
		icon: number;
	};
	callback: () => void | null;
}
