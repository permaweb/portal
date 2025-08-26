import React from 'react';
import useNavigate from 'engine/helpers/preview';
import Icon from 'engine/components/icon';
import * as ICONS from 'engine/constants/icons';
import { Panel } from 'engine/components/panel';
import { STORAGE } from 'helpers/config';
import ProfileEditor from 'engine/components/profileEditor';
import { checkValidAddress } from 'helpers/utils';
import { getTxEndpoint } from 'helpers/endpoints';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'engine/providers/portalProvider';
import { WanderConnect } from "@wanderapp/connect";

import * as S from './styles';

export default function WalletConnect(_props: { callback?: () => void }) {
	const navigate = useNavigate();
	const arProvider = useArweaveProvider();	
	const permawebProvider = usePermawebProvider();	
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const { auth } = arProvider;
	const { profile } = permawebProvider;
	const language = languageProvider.object?.[languageProvider.current] ?? null
	const [showUserMenu, setShowUserMenu] = React.useState<boolean>(false);
	const [showProfileManage, setShowProfileManage] = React.useState<boolean>(false);
	const [instance, setInstance] = React.useState(null);
	const [label, setLabel] = React.useState<string>('Log in');
	const [banner, setBanner] = React.useState<string>('');
	const [avatar, setAvatar] = React.useState<string>('');
	const wrapperRef = React.useRef();

	React.useEffect(() => {
		if(!instance){
			try {
				const wanderInstance = new WanderConnect({
					clientId: 'FREE_TRIAL',
					theme: 'Dark',				
					button: {
						parent: wrapperRef.current,
						label: false,
						customStyles: `
							#wanderConnectButtonHost {
								// display:none;
							}`,
					},
					iframe: {
						routeLayout: {
							default: {
								// type: 'dropdown',
								type: 'modal',
							},
							auth: {
								type: 'modal',
							},
							'auth-request': {
								type: 'modal',
							},
						},
						cssVars: {
							light: {
								shadowBlurred: 'none',
							},
							dark: {
								shadowBlurred: 'none',
								boxShadow: 'none',
							},
						},
						customStyles: ``,
					},
				});

				setInstance(wanderInstance);
				window.wanderInstance = wanderInstance;
			} catch (e) {
				console.error(e);
			}
		}		

    return () => {
      try {
        window.wanderInstance.destroy();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

	React.useEffect(() => {
		if(auth){
			const status = auth.authStatus
			if(status === 'loading') setLabel('Signing in') 
			else if((status === 'authenticated' || auth.authType === 'NATIVE_WALLET') && profile){
				setLabel(profile.displayName || 'My Profile')
				setAvatar(profile?.thumbnail && checkValidAddress(profile.thumbnail) ? `https://arweave.net/${profile?.thumbnail}` : '');
				setBanner(profile?.banner && checkValidAddress(profile.banner) ? `https://arweave.net/${profile?.banner}` : '');
			} 
		} else if (localStorage.getItem(STORAGE.walletType) === 'NATIVE_WALLET' && profile) {
			setLabel(profile.displayName || 'My Profile')
			setAvatar(profile?.thumbnail && checkValidAddress(profile.thumbnail) ? `https://arweave.net/${profile?.thumbnail}` : '');
			setBanner(profile?.banner && checkValidAddress(profile.banner) ? `https://arweave.net/${profile?.banner}` : '');
		} else {
			setLabel('Log in')
			setAvatar('');
			setBanner('');
		}
	}, [auth, profile]);

	function handlePress() {
		if(auth?.authStatus === 'authenticated' || auth?.authType === 'NATIVE_WALLET'){
			setShowUserMenu(!showUserMenu);
		} else {
			window.wanderInstance.open()
		}
	}

	function handleDisconnect() {
		setShowUserMenu(false);
		arProvider.handleDisconnect();
	}

	const shorten = (s: string) => s.slice(0, 7) + '....' + s.slice(-4);

	function getUserMenu() {
		return (
			<S.UserMenu>
				<S.HeaderWrapper>
						<S.Header>
							<S.Banner>
								<img
									className="missingBanner"
									onLoad={e => e.currentTarget.classList.remove('missingBanner')}
									src={banner} 
								/>
							</S.Banner>
							<S.Avatar>
								<img
									className="missingAvatar"
									onLoad={e => e.currentTarget.classList.remove('missingAvatar')}
									src={avatar}
								/>
							</S.Avatar>
							<S.DisplayName>{profile?.displayName ? profile.displayName : 'My Profile'}</S.DisplayName>
							<S.DAddress>
								{shorten(arProvider.walletAddress)}
								<Icon icon={ICONS.COPY} />
							</S.DAddress>
						</S.Header>
					
				</S.HeaderWrapper>
				<S.NavigationWrapper>
					<S.NavigationCategory>User</S.NavigationCategory>
					{profile?.id && (
						<S.NavigationEntry onClick={() => {
								setShowUserMenu(false)
								navigate(`user/${profile.id}`)
						}}>
							<Icon icon={ICONS.USER} />
							{language.myProfile}
						</S.NavigationEntry>
					)}					
					<S.NavigationEntry $disabled={!profile?.id}>
						<Icon icon={ICONS.POST} />
						{language.myPosts}
					</S.NavigationEntry>
					<S.NavigationEntry $disabled={!profile?.id}>
						<Icon icon={ICONS.COMMENTS} />
						{language.myComments}
					</S.NavigationEntry>
					{auth.authType !== 'NATIVE_WALLET' && (
						<S.NavigationEntry onClick={() => window.wanderInstance.open()}>
							<Icon icon={ICONS.WALLET} />
							{language.myWallet}
						</S.NavigationEntry>
					)}					
					<S.NavigationEntry onClick={() => setShowProfileManage(true)}>
						<Icon icon={profile?.id ? ICONS.EDIT : ICONS.USER} />
						{profile?.id ? language.editProfile : language.createProfile}
						{!profile?.id && <S.Hint><Icon icon={ICONS.INFO} /></S.Hint>}
					</S.NavigationEntry>
				</S.NavigationWrapper>
				<S.DSpacer />
				{profile?.id && (
					<>
						<S.NavigationWrapper>
							<S.NavigationCategory>Portal</S.NavigationCategory>
							<S.NavigationEntry onClick={() => {
								setShowUserMenu(false);
								portalProvider.setEditorMode('mini')
							}}>
								<Icon icon={ICONS.PORTAL} />
								Zone Editor
							</S.NavigationEntry>
							<S.NavigationEntry onClick={() => window.open('https://portal.arweave.net/', '_blank')}>
								<Icon icon={ICONS.PORTAL} />
								Portal Editor
							</S.NavigationEntry>
						</S.NavigationWrapper>
						<S.DSpacer />
					</>
				)}				
				<S.DFooterWrapper>
					<S.NavigationEntry onClick={handleDisconnect}>
						<Icon icon={ICONS.SIGN_OUT} />
						{language.disconnect}
					</S.NavigationEntry>
				</S.DFooterWrapper>
			</S.UserMenu>
		);
	}

	function getHeader() {
		return (
			<S.UserButton>
				<S.WanderConnectWrapper ref={wrapperRef} />
				{label && (
					<S.LAction onClick={handlePress}>
						{avatar ? <div><img src={checkValidAddress(avatar) ? getTxEndpoint(avatar) : avatar} /></div> : <Icon icon={ICONS.USER} />}
						<span>{label}</span>
					</S.LAction>
				)}
			</S.UserButton>
		);
	}

	function getView() {
		return (
			<S.Wrapper>
				{getHeader()}
				{showUserMenu && (
					<Panel open={showUserMenu} header={''} handleClose={() => setShowUserMenu(false)} width={300}>
						{getUserMenu()}
					</Panel>
				)}
			</S.Wrapper>
		);
	}

	return (
		<>			
			{getView()}
			{showProfileManage && (
				<Panel
					open={showProfileManage}
					header={profile && profile.id ? language.editProfile : `${language.createProfile}!`}
					handleClose={() => setShowProfileManage(false)}
				>
					<S.PManageWrapper>
						<ProfileEditor
							profile={profile && profile.id ? profile : null}
							handleClose={() => setShowProfileManage(false)}
							handleUpdate={null}
						/>
					</S.PManageWrapper>
				</Panel>
			)}
		</>
	);
}
