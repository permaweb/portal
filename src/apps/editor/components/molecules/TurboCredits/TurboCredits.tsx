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
	// Sort by highest remaining first (optional, feels nice)
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

	function handleRevoke(address: string) {}

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
								<small
									style={{ opacity: 0.7 }}
									onClick={() => {
										if (props.allowExpandApprovals) setShowGivenBreakdown((s) => !s);
									}}
								>
									({givenApprovalsCount})
								</small>
							</p>
						</S.MetaRow>
						{props.allowExpandApprovals && showGivenBreakdown && (
							<div
								style={{
									marginTop: 8,
									padding: '8px 10px',
									border: `1px solid ${
										/* @ts-ignore theme available in styles */ (S as any).theme?.colors?.border?.primary ??
										'rgba(0,0,0,0.1)'
									}`,
									borderRadius: 8,
									background: (S as any).theme?.colors?.container?.alt2?.background ?? 'transparent',
								}}
							>
								{/* Header row */}
								<div
									style={{
										display: 'grid',
										gridTemplateColumns: '1.6fr 0.6fr 1fr 1fr 1fr auto',
										gap: 8,
										fontWeight: 600,
										fontSize: 12,
										opacity: 0.8,
										padding: '4px 0',
									}}
								>
									<div>Address</div>
									<div>Count</div>
									<div>Approved</div>
									<div>Used</div>
									<div>Remaining</div>
									<div></div>
								</div>
								{/* Items */}
								{givenAggregated.map((g) => {
									const remaining = g.totalApproved - g.totalUsed;
									return (
										<div
											key={g.address}
											style={{
												display: 'grid',
												gridTemplateColumns: '1.6fr 0.6fr 1fr 1fr 1fr auto',
												gap: 8,
												alignItems: 'center',
												padding: '8px 0',
												borderTop: '1px solid rgba(0,0,0,0.06)',
											}}
										>
											<div style={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
												{g.address}
											</div>
											<div>{g.count}</div>
											<div>{getARAmountFromWinc(Number(g.totalApproved))} Credits</div>
											<div>{getARAmountFromWinc(Number(g.totalUsed))} Credits</div>
											<div>{getARAmountFromWinc(Number(remaining))} Credits</div>
											<div>
												<Button type="alt3" label="Revoke" handlePress={() => handleRevoke(g.address)} />
											</div>
										</div>
									);
								})}
							</div>
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
