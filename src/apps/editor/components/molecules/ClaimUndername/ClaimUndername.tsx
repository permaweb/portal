import React from 'react';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import * as S from './styles';
import { getPortalIdFromURL } from 'helpers/utils';
import { useNotifications } from 'providers/NotificationProvider';
import { useUndernamesProvider } from 'providers/UndernameProvider';
import { usePortalProvider } from 'editor/providers/PortalProvider';
import { ARIO } from '@ar.io/sdk';
import { PARENT_UNDERNAME, TESTING_UNDERNAME } from '../../../../../processes/undernames/constants';

type RuleState = {
	nonEmpty: boolean;
	maxLen: boolean;
	charset: boolean;
	notWWW: boolean;
	noAt: boolean;
	noEdgeDash: boolean;
	noEdgeUnderscore: boolean;
	noDoubleUnderscore: boolean;
	labelsValid: boolean;
};

const RESERVED = new Set(['www']); // extend later if registry adds more, can get from the process too
const MAX_UNDERNAME = 51;

function evaluateRules(raw: string): RuleState {
	const name = (raw || '').toLowerCase();

	const nonEmpty = name.length > 0;
	const maxLen = name.length <= MAX_UNDERNAME;

	// overall charset (what you already allow)
	const charset = /^[a-z0-9_.-]+$/.test(name);

	const notWWW = !RESERVED.has(name);
	const noAt = !name.includes('@');

	// whole-string edge checks
	const noEdgeDash = !/(^-|-$)/.test(name);
	const noEdgeUnderscore = !/(^_|_$)/.test(name);
	const noDoubleUnderscore = !/__/.test(name);

	// per-label checks (labels separated by underscore)
	// each label: [a-z0-9.-], no leading/trailing '-' or '.'
	const labels = name.split('_');
	const labelsValid =
		labels.length > 0 &&
		labels.every((l) => l.length > 0 && /^[a-z0-9.-]+$/.test(l) && !/^[-.]/.test(l) && !/[-.]$/.test(l));

	return {
		nonEmpty,
		maxLen,
		charset,
		notWWW,
		noAt,
		noEdgeDash,
		noEdgeUnderscore,
		noDoubleUnderscore,
		labelsValid,
	};
}

function firstError(rs: RuleState): string | null {
	if (!rs.nonEmpty) return 'Name is required';
	if (!rs.maxLen) return `Max ${MAX_UNDERNAME} characters`;
	if (!rs.charset) return 'Only a–z, 0–9, underscore (_), dot (.), and dash (-) allowed';
	if (!rs.notWWW) return 'Cannot be "www"';
	if (!rs.noAt) return 'Cannot contain "@"';
	if (!rs.noEdgeDash) return 'No leading or trailing dashes';
	if (!rs.noEdgeUnderscore) return 'No leading or trailing underscores';
	if (!rs.noDoubleUnderscore) return 'No consecutive underscores';
	if (!rs.labelsValid) return 'Each part must use a–z, 0–9, . or -, and cannot start/end with . or -';
	return null;
}

export default function ClaimUndername() {
	const { checkAvailability, request, owners } = useUndernamesProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const { addNotification } = useNotifications();
	const portalName = portalProvider.current.name || 'This portal';
	const [openClaim, setOpenClaim] = React.useState(false);
	const [name, setName] = React.useState(portalName.toLowerCase());
	const [ruleState, setRuleState] = React.useState<RuleState>(() => evaluateRules(name));
	const [error, setError] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState(false);
	const portalId = getPortalIdFromURL();
	const language = languageProvider.object[languageProvider.current];

	const ownedByPortal = React.useMemo(() => {
		if (!owners || !portalId) return false;
		return Object.values(owners ?? {}).some((entry: any) => entry.owner === portalId);
	}, [owners, portalId]);
	const nameTakenByOther = React.useMemo(() => {
		if (!owners || !portalId) return false;
		const entry = owners?.[name];
		if (!entry) return false;
		return entry.owner !== portalId;
	}, [owners, portalId, name]);

	const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const next = e.target.value.toLowerCase();
		setName(next);
		const rs = evaluateRules(next);
		setRuleState(rs);
		setError(firstError(rs));
	}, []);

	const handleRequest = React.useCallback(async () => {
		if (ownedByPortal) {
			setError('Portal already owns an subdomain');
			return;
		}
		if (nameTakenByOther) {
			setError('Subdomain is already assigned to another portal');
			return;
		}
		if (loading) return;

		const rs = evaluateRules(name);
		const err = firstError(rs);
		setRuleState(rs);
		setError(err);
		if (err) return;
		setLoading(true);
		const ario = ARIO.mainnet();
		const arnsRecord = await ario.getArNSRecord({ name: TESTING_UNDERNAME });
		const portalId = getPortalIdFromURL();
		try {
			const availability = await checkAvailability(name);
			if (!availability) {
				setError('Something went wrong, please try again later');
				return;
			}
			if (availability.reserved && !availability.reservedFor?.includes(portalId || '')) {
				setError('This subdomain is reserved for another portal');
				return;
			}
			if (!availability.available) {
				setError('Name is already taken');
				return;
			}
			await request(name.trim(), arnsRecord.processId); //process id of the parent undername
			setName('');
			setOpenClaim(false);
			addNotification('Subdomain request submitted', 'success');
		} finally {
			setLoading(false);
		}
	}, [name, ownedByPortal, loading, checkAvailability, request, addNotification]);

	if (ownedByPortal) return null;

	return (
		<>
			<Button type={'alt1'} label={'Claim Subdomain'} handlePress={() => setOpenClaim(true)} />
			<Panel
				open={openClaim}
				width={560}
				header={'Claim your subdomain'}
				handleClose={() => {
					setOpenClaim(false);
					setError(null);
				}}
				closeHandlerDisabled
			>
				<S.ClaimCard>
					<S.Row>
						<S.Input
							placeholder="Enter your subdomain"
							value={name}
							onChange={handleChange}
							maxLength={MAX_UNDERNAME}
						/>
						<Button
							type={'alt1'}
							label={language?.request || 'Request'}
							handlePress={handleRequest}
							disabled={loading || !name.trim() || !!error}
						/>
					</S.Row>
					{error && <S.Error>{error}</S.Error>}
					<S.Helper>
						<div style={{ display: 'grid', rowGap: 4 }}>
							<span>{ruleState.nonEmpty ? '✅' : '❌'} Not empty</span>
							<span>
								{ruleState.maxLen ? '✅' : '❌'} ≤ {MAX_UNDERNAME} characters
							</span>
							<span>{ruleState.charset ? '✅' : '❌'} Allowed: a–z, 0–9, `_ . -`</span>
							<span>{ruleState.notWWW ? '✅' : '❌'} Not "www"</span>
							<span>{ruleState.noAt ? '✅' : '❌'} No "@"</span>
							<span>{ruleState.noEdgeDash ? '✅' : '❌'} No leading/trailing dashes</span>
							<span>{ruleState.noEdgeUnderscore ? '✅' : '❌'} No leading/trailing underscores</span>
							<span>{ruleState.noDoubleUnderscore ? '✅' : '❌'} No consecutive underscores</span>
							<span>
								{ruleState.labelsValid ? '✅' : '❌'} Each part valid (a–z, 0–9, . or -, not starting/ending with . or
								-)
							</span>
						</div>
					</S.Helper>
				</S.ClaimCard>
			</Panel>
		</>
	);
}
