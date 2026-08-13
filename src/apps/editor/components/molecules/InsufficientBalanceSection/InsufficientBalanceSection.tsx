import { InsufficientBalanceCTA } from 'components/molecules/Payment';
import { useArIOBalance } from 'hooks/useArIOBalance';

const InsufficientBalanceSection = ({ extendCost, extendCostLoading }) => {
	const { balance: arIOBalance } = useArIOBalance();
	const due = extendCost?.mario;
	const bal = arIOBalance;
	const loadingCost = extendCostLoading || due == null;
	const loadingBal = arIOBalance == null;
	const insufficient = !(due != null && bal != null && bal >= due);
	const isLoading = loadingCost || loadingBal;
	return insufficient && !isLoading ? (
		<InsufficientBalanceCTA
			method={'ario'}
			insufficient={insufficient}
			isLoading={isLoading}
			onGetTokens={() =>
				window.open('https://botega.arweave.net/#/swap?to=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE', '_blank')
			}
		/>
	) : null;
};

export default InsufficientBalanceSection;
