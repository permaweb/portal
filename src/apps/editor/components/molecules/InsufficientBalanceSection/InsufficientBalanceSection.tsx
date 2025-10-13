import { InsufficientBalanceCTA } from 'components/molecules/Payment';
import { IS_TESTNET } from 'helpers/config';
import { useArIOBalance } from 'hooks/useArIOBalance';
import { useArweaveProvider } from 'providers/ArweaveProvider';

const InsufficientBalanceSection = ({ extendCost, extendCostLoading, extendPaymentMethod, setShowFund }) => {
	const arProvider = useArweaveProvider();
	const { balance: arIOBalance } = useArIOBalance();
	const due = IS_TESTNET || extendPaymentMethod === 'ario' ? extendCost?.mario : extendCost?.winc;
	const bal = IS_TESTNET || extendPaymentMethod === 'ario' ? arIOBalance : arProvider.turboBalance;
	const loadingCost = extendCostLoading || due == null;
	const loadingBal = IS_TESTNET
		? arIOBalance == null
		: extendPaymentMethod === 'ario'
		? arIOBalance == null
		: arProvider.turboBalance == null;
	const insufficient = !(due != null && bal != null && bal >= due);
	const isLoading = loadingCost || loadingBal;
	return insufficient && !isLoading ? (
		<S.InsufficientBalanceWrapper>
			<InsufficientBalanceCTA
				method={IS_TESTNET ? 'ario' : extendPaymentMethod}
				insufficient={insufficient}
				isLoading={isLoading}
				onGetTokens={() =>
					window.open('https://botega.arweave.net/#/swap?to=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE', '_blank')
				}
				onAddCredits={() => setShowFund(true)}
			/>
		</S.InsufficientBalanceWrapper>
	) : null;
};

export default InsufficientBalanceSection;
