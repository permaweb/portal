import React from 'react';
import { useNavigate } from 'react-router-dom';

import { WordPressImport } from 'editor/components/organisms/WordPressImport';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { executeWordPressImport } from 'helpers/import';
import { ConvertedPost, PortalImportData } from 'helpers/wordpress';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

interface WordPressImportContextState {
	showWordPressImport: boolean;
	setShowWordPressImport: (toggle: boolean, createPortal?: boolean) => void;
	wordPressImportCreatePortal: boolean;
	importWordPress: (
		data: PortalImportData,
		posts: ConvertedPost[],
		pages: ConvertedPost[],
		selectedCategories: Set<string>,
		createCategories: boolean,
		createTopics: boolean,
		selectedTopics?: Set<string>,
		createPortal?: boolean,
		uploadedImageUrls?: Map<string, string>,
		redirectPath?: string,
		redirectToCreate?: boolean,
		mediaOverrides?: {
			logoId?: string | null;
			iconId?: string | null;
			wallpaperId?: string | null;
		}
	) => Promise<void>;
}

const DEFAULT_CONTEXT: WordPressImportContextState = {
	showWordPressImport: false,
	setShowWordPressImport(_toggle: boolean, _createPortal?: boolean) {},
	wordPressImportCreatePortal: false,
	importWordPress: async () => {},
};

const WordPressImportContext = React.createContext<WordPressImportContextState>(DEFAULT_CONTEXT);

export function useWordPressImportProvider(): WordPressImportContextState {
	return React.useContext(WordPressImportContext);
}

export function WordPressImportProvider(props: { children: React.ReactNode }) {
	const navigate = useNavigate();

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const { addNotification } = useNotifications();

	const [showWordPressImport, setShowWordPressImport] = React.useState<boolean>(false);
	const [wordPressImportCreatePortal, setWordPressImportCreatePortal] = React.useState<boolean>(false);

	function handleShowWordPressImport(toggle: boolean, createPortal?: boolean) {
		setShowWordPressImport(toggle);
		setWordPressImportCreatePortal(createPortal ?? false);
	}

	async function handleWordPressImportComplete(
		data: PortalImportData,
		posts: ConvertedPost[],
		pages: ConvertedPost[],
		selectedCategories: Set<string>,
		createCategories: boolean,
		createTopics: boolean,
		selectedTopics?: Set<string>,
		createPortal?: boolean,
		uploadedImageUrls?: Map<string, string>,
		redirectPath?: string,
		redirectToCreate?: boolean,
		mediaOverrides?: {
			logoId?: string | null;
			iconId?: string | null;
			wallpaperId?: string | null;
		}
	) {
		await executeWordPressImport(
			{
				wallet: arProvider.wallet,
				walletAddress: arProvider.walletAddress,
				libs: permawebProvider.libs,
				profile: permawebProvider.profile,
				refreshProfile: permawebProvider.refreshProfile,
				current: portalProvider.current,
				permissions: portalProvider.permissions,
				refreshCurrentPortal: portalProvider.refreshCurrentPortal,
				loadPortal: portalProvider.loadPortal,
				addNotification,
				navigate,
			},
			{
				data,
				posts,
				pages,
				selectedCategories,
				createCategories,
				createTopics,
				selectedTopics,
				createPortal,
				uploadedImageUrls,
				redirectPath,
				redirectToCreate,
				mediaOverrides,
			}
		);
	}

	return (
		<WordPressImportContext.Provider
			value={{
				showWordPressImport,
				setShowWordPressImport: handleShowWordPressImport,
				wordPressImportCreatePortal,
				importWordPress: handleWordPressImportComplete,
			}}
		>
			{props.children}
			<WordPressImport
				open={showWordPressImport}
				handleClose={() => setShowWordPressImport(false)}
				createPortal={wordPressImportCreatePortal || !portalProvider.current?.id}
				onImportComplete={(
					data,
					posts,
					pages,
					selectedCategories,
					createCategories,
					createTopics,
					selectedTopics,
					uploadedImageUrls
				) =>
					handleWordPressImportComplete(
						data,
						posts,
						pages,
						selectedCategories,
						createCategories,
						createTopics,
						selectedTopics,
						wordPressImportCreatePortal || !portalProvider.current?.id,
						uploadedImageUrls
					)
				}
			/>
		</WordPressImportContext.Provider>
	);
}
