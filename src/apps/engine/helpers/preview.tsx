import { useNavigate as realUseNavigate } from 'react-router-dom';

let safeNavigate = () => {};

export function useNavigate() {
	try {
		return realUseNavigate();
	} catch {
		return safeNavigate;
	}
}

export default useNavigate;
