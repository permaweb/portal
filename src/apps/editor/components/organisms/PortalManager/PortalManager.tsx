import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Media } from 'editor/components/molecules/Media';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import {
	DEFAULT_LAYOUT,
	DEFAULT_PAGES,
	DEFAULT_THEME,
	PORTAL_DATA,
	PORTAL_PATCH_MAP,
	PORTAL_ROLES,
	URLS,
} from 'helpers/config';
import { PortalDetailType, PortalHeaderType, PortalPatchMapEnum } from 'helpers/types';
import { checkValidAddress, getBootTag } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { WalletBlock } from 'wallet/WalletBlock';

import * as S from './styles';
import { useUndernamesProvider } from 'providers/UndernameProvider';
import { ARIO } from '@ar.io/sdk';
import { PARENT_UNDERNAME, TESTING_UNDERNAME } from '../../.../../../../../processes/undernames/constants';

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

const RESERVED = new Set(['www']);
const MAX_UNDERNAME = 51;

// derive from portal name
function deriveSubdomain(raw: string): string {
	if (!raw) return '';
	let n = raw.toLowerCase();
	n = n.replace(/\s+/g, '-'); // spaces -> dash
	n = n.replace(/[^a-z0-9_.-]/g, ''); // strip invalid
	n = n.replace(/-{2,}/g, '-'); // collapse --
	n = n.replace(/_{2,}/g, '_'); // collapse __
	n = n.replace(/^\-+|\-+$/g, ''); // trim edge dashes
	n = n.replace(/^_+|_+$/g, ''); // trim edge underscores
	return n.slice(0, MAX_UNDERNAME);
}

function evaluateRules(raw: string): RuleState {
	const name = (raw || '').toLowerCase();
	const nonEmpty = name.length > 0;
	const maxLen = name.length <= MAX_UNDERNAME;
	const charset = /^[a-z0-9_.-]+$/.test(name);
	const notWWW = !RESERVED.has(name);
	const noAt = !name.includes('@');
	const noEdgeDash = !/(^-|-$)/.test(name);
	const noEdgeUnderscore = !/(^_|_$)/.test(name);
	const noDoubleUnderscore = !/__/.test(name);
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
	if (!rs.nonEmpty) return 'Subdomain is required';
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

export default function PortalManager(props: {
	portal: PortalDetailType | null;
	handleClose: () => void;
	handleUpdate: () => void;
}) {
	const navigate = useNavigate();

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const isCreating = !props.portal;

	const [claimSub, setClaimSub] = React.useState(false);
	const [subName, setSubName] = React.useState('');
	const [subRules, setSubRules] = React.useState<RuleState>(() => evaluateRules(''));
	const [subError, setSubError] = React.useState<string | null>(null);

	const { checkAvailability, requestForNewPortal } = useUndernamesProvider();

	const [name, setName] = React.useState<string>('');
	const [availability, setAvailability] = React.useState<{
		loading: boolean;
		available?: boolean;
		reserved?: boolean;
		reservedFor?: string | null;
		error?: string | null;
	}>({ loading: false });
	const [logoId, setLogoId] = React.useState<string | null>(null);
	const [iconId, setIconId] = React.useState<string | null>(null);
	const [subTouched, setSubTouched] = React.useState(false);
	const [loading, setLoading] = React.useState<boolean>(false);
	const { addNotification } = useNotifications();

	const isAllRulesOk = !subError && !!subName;
	const reservedForYou =
		availability.reserved &&
		availability.reservedFor &&
		arProvider.walletAddress &&
		availability.reservedFor.toLowerCase() === arProvider.walletAddress.toLowerCase();

	const isAvailableToProceed = availability.available === true && (!availability.reserved || reservedForYou === true);

	React.useEffect(() => {
		if (props.portal) {
			setName(props.portal.name ?? '');
			setLogoId(props.portal.logo || null);
			setIconId(props.portal.icon || null);
		} else {
			setName('');
			setLogoId(null);
			setIconId(null);
		}
	}, [props.portal]);

	React.useEffect(() => {
		setSubTouched(false);
		setSubName('');
	}, [claimSub]);

	React.useEffect(() => {
		if (!isCreating || !claimSub) return;

		if (!subTouched) {
			const derived = deriveSubdomain(name);
			if (derived !== subName) {
				setSubName(derived);
				const rs = evaluateRules(derived);
				setSubRules(rs);
				setSubError(firstError(rs));
			}
		}
	}, [isCreating, claimSub, subTouched, name, subName]);

	React.useEffect(() => {
		if (!claimSub) {
			setAvailability({ loading: false });
			return;
		}
		if (!isAllRulesOk) {
			// invalid input -> don’t ping availability
			setAvailability((prev) => ({
				...prev,
				loading: false,
				available: undefined,
				reserved: undefined,
				reservedFor: null,
			}));
			return;
		}

		const handle = setTimeout(async () => {
			setAvailability({ loading: true });
			try {
				const res = await checkAvailability(subName.trim());
				setAvailability({
					loading: false,
					available: !!res?.available,
					reserved: !!res?.reserved,
					reservedFor: res?.reservedFor ?? null,
					error: null,
				});
			} catch (e: any) {
				setAvailability({ loading: false, error: e?.message || 'Failed to check availability' });
			}
		}, 400);

		return () => clearTimeout(handle);
	}, [claimSub, isAllRulesOk, subName, checkAvailability]);

	const handleSubChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const next = e.target.value.toLowerCase();
		setSubTouched(true);
		setSubName(next);
		const rs = evaluateRules(next);
		setSubRules(rs);
		setSubError(firstError(rs));
	}, []);

	async function handleSubmit() {
		if (arProvider.wallet && permawebProvider.profile?.id) {
			setLoading(true);

			try {
				let profileUpdateId: string | null;
				let response: string | null;

				let data: any = { Name: name };

				if (logoId && checkValidAddress(logoId)) {
					try {
						data.Logo = await permawebProvider.libs.resolveTransaction(logoId);
					} catch (e: any) {
						console.error(`Failed to resolve logo: ${e.message}`);
					}
				} else {
					data.Logo = 'None';
				}

				if (iconId && checkValidAddress(iconId)) {
					try {
						data.Icon = await permawebProvider.libs.resolveTransaction(iconId);
					} catch (e: any) {
						console.error(`Failed to resolve icon: ${e.message}`);
					}
				} else {
					data.Icon = 'None';
				}

				if (props.portal?.id && portalProvider.permissions?.updatePortalMeta) {
					const portalsUpdateData = portalProvider.portals
						.filter((portal: PortalHeaderType) => portal.id !== props.portal.id)
						.map((portal: PortalHeaderType) => ({
							Id: portal.id,
							Name: portal.name,
							Logo: portal.logo,
							Icon: portal.icon,
						}));
					portalsUpdateData.push({ Id: props.portal.id, ...data });

					const portalUpdateId = await permawebProvider.libs.updateZone(data, props.portal.id, arProvider.wallet);

					console.log(`Portal update: ${portalUpdateId}`);

					profileUpdateId = await permawebProvider.libs.updateZone(
						{ Portals: portalsUpdateData },
						permawebProvider.profile.id,
						arProvider.wallet
					);

					response = `${language?.portalUpdated}!`;

					portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Overview);
				} else {
					const getPatchMapTag = (key: string, values: string[]) => {
						const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
						return {
							name: `Zone-Patch-Map-${capitalizedKey}`,
							value: JSON.stringify(values),
						};
					};

					const tags = [
						getBootTag('Name', data.Name),
						{ name: 'Content-Type', value: 'text/html' },
						{ name: 'Zone-Type', value: 'Portal' },
					];

					for (const key of Object.keys(PORTAL_PATCH_MAP)) {
						tags.push(getPatchMapTag(key, PORTAL_PATCH_MAP[key]));
					}

					if (data.Logo) tags.push(getBootTag('Logo', data.Logo));
					if (data.Icon) tags.push(getBootTag('Icon', data.Icon));

					const portalId = await permawebProvider.libs.createZone({ tags: tags, data: PORTAL_DATA() }, (status: any) =>
						console.log(status)
					);

					console.log(`Portal ID: ${portalId}`);

					const rolesUpdate = await permawebProvider.libs.setZoneRoles(
						[
							{ granteeId: arProvider.walletAddress, roles: [PORTAL_ROLES.ADMIN], type: 'wallet', sendInvite: false },
							{
								granteeId: permawebProvider.profile.id,
								roles: [PORTAL_ROLES.ADMIN],
								type: 'process',
								sendInvite: false,
							},
						],
						portalId,
						arProvider.wallet
					);

					console.log(`Roles update: ${rolesUpdate}`);

					const currentPortals = Array.isArray(permawebProvider.profile?.portals)
						? permawebProvider.profile.portals
						: [];

					const updatedPortals = [...currentPortals, { Id: portalId, ...data }];

					profileUpdateId = await permawebProvider.libs.updateZone(
						{ Portals: permawebProvider.libs.mapToProcessCase(updatedPortals) },
						permawebProvider.profile.id,
						arProvider.wallet
					);

					const portalUpdateId = await permawebProvider.libs.updateZone(
						{
							Themes: [permawebProvider.libs.mapToProcessCase(DEFAULT_THEME)],
							Layout: permawebProvider.libs.mapToProcessCase(DEFAULT_LAYOUT),
							Pages: permawebProvider.libs.mapToProcessCase(DEFAULT_PAGES),
						},
						portalId,
						arProvider.wallet
					);

					console.log(`Portal update: ${portalUpdateId}`);

					response = `${language?.portalCreated}!`;
					if (claimSub) {
						console.log('Will claim subdomain', subName, 'for portal', portalId);
						const rs = evaluateRules(subName);
						const err = firstError(rs);
						if (!err && subName) {
							try {
								const avail = await checkAvailability(subName);
								console.log('Subdomain availability', avail);
								if (avail && avail.available && (!avail.reserved || avail.reservedFor === arProvider.walletAddress)) {
									const ario = ARIO.mainnet();
									const arnsRecord = await ario.getArNSRecord({ name: TESTING_UNDERNAME }); // after testing we change to PARENT_UNDERNAME
									await requestForNewPortal(subName.trim(), arnsRecord.processId, portalId);
									console.log(`Requested undername "${subName}" for portal ${portalId}`);
								} else {
									console.warn(`Subdomain "${subName}" not available`, avail);
								}
							} catch (e) {
								console.error('Failed to request subdomain:', e);
							}
						} else {
							console.warn('Subdomain invalid at save time:', err);
						}
					}
					navigate(URLS.portalBase(portalId));
				}

				if (profileUpdateId) console.log(`Profile update: ${profileUpdateId}`);

				permawebProvider.refreshProfile();

				if (props.handleUpdate) props.handleUpdate();
				if (props.handleClose) props.handleClose();

				setName('');
				setLogoId(null);
				setIconId(null);

				addNotification(response, 'success');
			} catch (e: any) {
				addNotification(e.message ?? language?.errorUpdatingPortal, 'warning');
			}

			setLoading(false);
		}
	}

	function handleMediaUpdate() {
		// For existing portals, refresh the logo and icon from the portal data
		if (props.portal) {
			if (props.portal.logo) {
				setLogoId(props.portal.logo);
			}
			if (props.portal.icon) {
				setIconId(props.portal.icon);
			}
		}
	}

	function handleLogoUpload(mediaId: string) {
		setLogoId(mediaId);
	}

	function handleIconUpload(mediaId: string) {
		setIconId(mediaId);
	}

	function getConnectedView() {
		if (!arProvider.walletAddress) return <WalletBlock />;
		else {
			return (
				<>
					<S.Wrapper>
						<S.Body>
							<S.Form>
								<S.TForm>
									<FormField
										label={language?.name}
										value={name}
										onChange={(e: any) => setName(e.target.value)}
										disabled={loading}
										invalid={{ status: false, message: null }}
										required
										hideErrorMessage
									/>
									{isCreating && (
										<S.SubdomainSection>
											<S.CheckRow>
												<input
													type="checkbox"
													id="claim-subdomain"
													checked={claimSub}
													onChange={(e) => setClaimSub(e.target.checked)}
													disabled={loading}
												/>
												<label htmlFor="claim-subdomain">Claim subdomain for this portal</label>
											</S.CheckRow>

											{claimSub && (
												<S.SubdomainCard>
													<S.SubdomainHeader>
														<span>Subdomain</span>
													</S.SubdomainHeader>

													<S.SubdomainInput
														placeholder="my-subdomain"
														value={subName}
														onChange={handleSubChange}
														maxLength={MAX_UNDERNAME}
														disabled={loading}
													/>
													<S.SubdomainHint>
														Preview:{' '}
														<a
															href={`https://${subName || '…'}_${PARENT_UNDERNAME}.arweave.net/`}
															target="_blank"
															rel="noopener noreferrer"
															onClick={(e) => {
																if (!subName) e.preventDefault();
															}}
														>
															https://{subName || '…'}_{PARENT_UNDERNAME}.arweave.net/
														</a>
													</S.SubdomainHint>

													{/* validations */}
													{claimSub && (
														<S.StatusLine>
															{subError ? (
																<>❌ {subError}</>
															) : !subName ? (
																<> </>
															) : availability.loading ? (
																<>⏳ Checking availability…</>
															) : availability.error ? (
																<>❌ {availability.error}</>
															) : availability.available === false ? (
																<>❌ This subdomain is not available.</>
															) : reservedForYou ? (
																<>✅ You’re good to go — reserved for you.</>
															) : availability.available ? (
																<>✅ You’re good to go — a request will be reviewed by an admin.</>
															) : null}
														</S.StatusLine>
													)}
												</S.SubdomainCard>
											)}
										</S.SubdomainSection>
									)}
								</S.TForm>
							</S.Form>
							<S.PWrapper>
								<Media
									portal={props.portal}
									type={'logo'}
									handleUpdate={handleMediaUpdate}
									onMediaUpload={handleLogoUpload}
									hideActions={!props.portal}
								/>
								<S.IconWrapper className={'border-wrapper-alt2'}>
									<Media
										portal={props.portal}
										type={'icon'}
										handleUpdate={handleMediaUpdate}
										onMediaUpload={handleIconUpload}
										hideActions={!props.portal}
									/>
								</S.IconWrapper>
							</S.PWrapper>
							<S.SAction>
								{props.handleClose && (
									<Button
										type={'primary'}
										label={language?.close}
										handlePress={() => props.handleClose()}
										disabled={loading}
										loading={false}
									/>
								)}
								<Button
									type={'alt1'}
									label={language?.save}
									handlePress={handleSubmit}
									disabled={
										!name ||
										loading ||
										(isCreating && claimSub && (!isAllRulesOk || availability.loading || !isAvailableToProceed))
									}
									loading={false}
								/>
							</S.SAction>
						</S.Body>
					</S.Wrapper>
					{loading && (
						<Loader
							message={
								props.portal && props.portal.id
									? `${language?.portalUpdatingInfo}...`
									: `${language?.portalCreatingInfo}...`
							}
						/>
					)}
				</>
			);
		}
	}

	return getConnectedView();
}
