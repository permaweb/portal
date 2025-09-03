import React from 'react';
import { Accordion } from 'components/atoms/Accordion';
import { Button } from 'components/atoms/Button';
import { ASSETS } from 'helpers/config';
import { getARAmountFromWinc } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { Panel } from 'components/atoms/Panel';
import { TurboBalanceFund } from 'components/molecules/TurboBalanceFund';
import * as S from './styles';
import { TurboFactory, ArconnectSigner } from '@ardrive/turbo-sdk/web';
import { useNotifications } from 'providers/NotificationProvider';

type Props = {
	showBorderBottom?: boolean;
	allowExpandApprovals?: boolean;
};

interface TurboApproval {
	approvalDataItemId: string;
	approvedAddress: string;
	approvedWincAmount: string;
	creationDate: string;
	payingAddress: string;
	usedWincAmount: string;
}

function sumApprovals(approvals: TurboApproval[] = []) {
	return approvals.reduce((acc, a) => acc + BigInt(a.approvedWincAmount), 0n);
}

type AggregatedApproval = {
	address: string;
	count: number;
	totalApproved: bigint;
	totalUsed: bigint;
	approvals: TurboApproval[];
};

function aggregateByAddress(approvals: TurboApproval[] = []): AggregatedApproval[] {
	const map = new Map<string, AggregatedApproval>();
	for (const a of approvals) {
		const key = a.approvedAddress;
		const entry = map.get(key) ?? {
			address: key,
			count: 0,
			totalApproved: 0n,
			totalUsed: 0n,
			approvals: [],
		};
		entry.count += 1;
		entry.totalApproved += BigInt(a.approvedWincAmount || '0');
		entry.totalUsed += BigInt(a.usedWincAmount || '0');
		entry.approvals.push(a);
		map.set(key, entry);
	}
	// Sort by highest remaining first
	return Array.from(map.values()).sort((a, b) => {
		const ra = a.totalApproved - a.totalUsed;
		const rb = b.totalApproved - b.totalUsed;
		if (rb > ra) return 1;
		if (rb < ra) return -1;
		return a.address.localeCompare(b.address);
	});
}

export default function TurboCredits(props: Props) {
	const arProvider = useArweaveProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [expanded, setExpanded] = React.useState<boolean>(false);
	const [showGivenBreakdown, setShowGivenBreakdown] = React.useState<boolean>(false);
	const [showFundUpload, setShowFundUpload] = React.useState<boolean>(false);
	const { addNotification } = useNotifications();

	const signer = new ArconnectSigner(arProvider.wallet);
	const turbo = TurboFactory.authenticated({ signer });

	const totalGivenBig = React.useMemo(
		() => sumApprovals(arProvider?.turboBalanceObj.givenApprovals),
		[arProvider?.turboBalanceObj.givenApprovals]
	);

	const totalReceivedBig = React.useMemo(
		() => sumApprovals(arProvider?.turboBalanceObj.receivedApprovals),
		[arProvider?.turboBalanceObj.receivedApprovals]
	);

	const givenAggregated = React.useMemo(
		() => aggregateByAddress(arProvider?.turboBalanceObj.givenApprovals),
		[arProvider?.turboBalanceObj.givenApprovals]
	);

	const givenApprovalsCount = arProvider?.turboBalanceObj.givenApprovals?.length ?? 0;
	const receivedApprovalsCount = arProvider?.turboBalanceObj.receivedApprovals?.length ?? 0;

	function toggleExpand() {
		setExpanded(!expanded);
	}

	async function handleRevoke(address: string) {
		const revokedApprovals = await turbo.revokeCredits({
			revokedAddress: address,
		});
		if (!revokedApprovals) {
			addNotification(language?.errorRevokingCredits, 'warning');
			return;
		}
		if (revokedApprovals) {
			addNotification(language?.successfulyRevokedCredits, 'success');
			arProvider.refreshTurboBalance();
		}
	}

	return (
		<S.DBalanceWrapper showBorderBottom={props.showBorderBottom}>
			<S.DBalanceHeader>
				<p>{language?.creditBalance}</p>
			</S.DBalanceHeader>
			<S.DBalanceBody>
				<Accordion
					showTopDivider={false}
					expanded={expanded}
					onExpandedChange={setExpanded}
					title={
						<p>
							{arProvider.turboBalance !== null
								? `${getARAmountFromWinc(arProvider.turboBalance)} ${language?.credits}`
								: `${language?.loading}...`}
						</p>
					}
					renderActions={({ expanded }) => (
						<>
							<Button
								type="alt3"
								label={language?.add}
								handlePress={() => setShowFundUpload(true)}
								icon={ASSETS.add}
								iconLeftAlign
							/>
							<Button
								type="alt3"
								label={expanded ? language?.seeLess ?? 'See less' : language?.seeMore ?? 'See more'}
								handlePress={toggleExpand}
							/>
						</>
					)}
				>
					<S.AccordionContent>
						<S.MetaRow>
							<span>Controlled</span>
							<p>{getARAmountFromWinc(Number(arProvider?.turboBalanceObj.controlledWinc))} Credits</p>
						</S.MetaRow>

						<S.MetaRow>
							<span>Effective balance</span>
							<p>{getARAmountFromWinc(Number(arProvider?.turboBalanceObj.effectiveBalance))} Credits</p>
						</S.MetaRow>
						<S.MetaRow>
							<span>Received approvals</span>
							<p>
								{getARAmountFromWinc(Number(totalReceivedBig))} Credits{' '}
								<small style={{ opacity: 0.7 }}>({receivedApprovalsCount})</small>
							</p>
						</S.MetaRow>
						<S.MetaRow>
							<span>Given approvals</span>
							<p>
								{getARAmountFromWinc(Number(totalGivenBig))} Credits{' '}
								<S.ApprovalsCount
									clickable={props.allowExpandApprovals}
									onClick={() => {
										if (props.allowExpandApprovals) setShowGivenBreakdown((s) => !s);
									}}
								>
									({givenApprovalsCount})
								</S.ApprovalsCount>
							</p>
						</S.MetaRow>
						{props.allowExpandApprovals && showGivenBreakdown && (
							<S.ApprovalsWrapper>
								<S.ApprovalsHeaderRow>
									<p>Address</p>
									<p>Approved</p>
									<p>Remaining</p>
									<div></div>
								</S.ApprovalsHeaderRow>
								{givenAggregated.map((g) => {
									const remaining = g.totalApproved - g.totalUsed;
									return (
										<S.ApprovalRow key={g.address}>
											<S.Address>{g.address}</S.Address>
											<S.Num>{getARAmountFromWinc(Number(g.totalApproved))}&nbsp;Credits</S.Num>
											<S.Num>{getARAmountFromWinc(Number(remaining))}&nbsp;Credits</S.Num>
											<S.Actions>
												<Button type="warning" label="Revoke" handlePress={() => handleRevoke(g.address)} />
											</S.Actions>
										</S.ApprovalRow>
									);
								})}
							</S.ApprovalsWrapper>
						)}
					</S.AccordionContent>
				</Accordion>
			</S.DBalanceBody>
			<Panel
				open={showFundUpload}
				width={575}
				header={language?.fundTurboBalance}
				handleClose={() => setShowFundUpload(false)}
				className={'modal-wrapper'}
			>
				<TurboBalanceFund handleClose={() => setShowFundUpload(false)} />
			</Panel>
		</S.DBalanceWrapper>
	);
}
