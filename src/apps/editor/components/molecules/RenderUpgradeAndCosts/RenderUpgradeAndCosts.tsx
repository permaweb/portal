import { Button } from 'components/atoms/Button';
import { usePortalProvider } from 'editor/providers/PortalProvider';
import { IS_TESTNET } from 'helpers/config';
import { UserOwnedDomain } from 'helpers/types';
import { getARAmountFromWinc, toReadableARIO } from 'helpers/utils';
import { useArIOBalance } from 'hooks/useArIOBalance';
import * as S from './styles';

const RenderUpgradeAndCosts = (props: {
	domain: UserOwnedDomain;
	costsByAntId: Record<
		string,
		{
			extend?: { winc: number; mario: number; fiatUSD: string | null };
			upgrade?: { winc: number; mario: number; fiatUSD: string | null };
		}
	>;
	extendingDomains: Set<string>;
	upgradingDomains: Set<string>;
	setExtendModal: React.Dispatch<React.SetStateAction<{ open: boolean; domain?: UserOwnedDomain; years: number }>>;
	setUpgradeModal: React.Dispatch<React.SetStateAction<{ open: boolean; domain?: UserOwnedDomain }>>;
}) => {
	const portalProvider = usePortalProvider();
	const { balance: arIOBalance } = useArIOBalance();
	if (props.domain.recordType !== 'lease') return null;
	const canModifyDomains = portalProvider.permissions?.updatePortalMeta;
	if (!canModifyDomains) return null;

	const entry = props.costsByAntId[props.domain.antId];
	const valueText = (c?: { winc: number; mario: number; fiatUSD: string | null }) => {
		if (IS_TESTNET) return c ? `${toReadableARIO(c.mario)} tario` : '…';
		if (!c) return '…';
		const creditsText = `${getARAmountFromWinc(c.winc)} Credits${c.fiatUSD ? ` ($${c.fiatUSD})` : ''}`;
		const showArio = !!(arIOBalance && arIOBalance > 0);
		return showArio ? `${creditsText} • ${toReadableARIO(c.mario)} ARIO` : creditsText;
	};
	return (
		<S.DomainCosts>
			<div className={'details-grid'}>
				<S.DomainDetailLine>
					<div className={'label'}>Extend (1 Year)</div>
					<S.DomainDetailDivider />
					<div className={'value'}>{valueText(entry?.extend)}</div>
				</S.DomainDetailLine>
				<S.DomainDetailLine>
					<div className={'label'}>Go Permanent</div>
					<S.DomainDetailDivider />
					<div className={'value'}>{valueText(entry?.upgrade)}</div>
				</S.DomainDetailLine>
			</div>
			<S.DomainCostActions>
				<Button
					type={'primary'}
					label={props.extendingDomains.has(props.domain.name) ? 'Extending…' : 'Extend Lease'}
					handlePress={() => props.setExtendModal({ open: true, domain: props.domain, years: 1 })}
					disabled={props.extendingDomains.has(props.domain.name)}
				/>
				<Button
					type={'alt1'}
					label={props.upgradingDomains.has(props.domain.name) ? 'Upgrading…' : 'Go Permanent'}
					handlePress={() => props.setUpgradeModal({ open: true, domain: props.domain })}
					disabled={props.upgradingDomains.has(props.domain.name)}
				/>
			</S.DomainCostActions>
		</S.DomainCosts>
	);
};

export default RenderUpgradeAndCosts;
