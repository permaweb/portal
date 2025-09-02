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

type Props = {};

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

export default function TurboCredits(props: Props) {
	const arProvider = useArweaveProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [expanded, setExpanded] = React.useState<boolean>(false);
	const [showFundUpload, setShowFundUpload] = React.useState<boolean>(false);

	const totalGivenBig = React.useMemo(
		() => sumApprovals(arProvider?.turboBalanceObj.givenApprovals),
		[arProvider?.turboBalanceObj.givenApprovals]
	);

	const totalReceivedBig = React.useMemo(
		() => sumApprovals(arProvider?.turboBalanceObj.receivedApprovals),
		[arProvider?.turboBalanceObj.receivedApprovals]
	);

	const givenApprovalsCount = arProvider?.turboBalanceObj.givenApprovals?.length ?? 0;
	const receivedApprovalsCount = arProvider?.turboBalanceObj.receivedApprovals?.length ?? 0;

	function toggleExpand() {
		setExpanded(!expanded);
	}
	return (
		<S.DBalanceWrapper>
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
							<span>Given approvals</span>
							<p>
								{getARAmountFromWinc(Number(totalGivenBig))} Credits{' '}
								<small style={{ opacity: 0.7 }}>({givenApprovalsCount})</small>
							</p>
						</S.MetaRow>
						<S.MetaRow>
							<span>Received approvals</span>
							<p>
								{getARAmountFromWinc(Number(totalReceivedBig))} Credits{' '}
								<small style={{ opacity: 0.7 }}>({receivedApprovalsCount})</small>
							</p>
						</S.MetaRow>
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
