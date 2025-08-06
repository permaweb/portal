import React from 'react';
export interface PortalContextState {
	portalId: string | null;
	setPortalId: (portalId: string) => void;
	editorMode: string;
	setEditorMode: (mode: string) => void;
}

const DEFAULT_CONTEXT = {
	portalId: null,
	setPortalId(_portalId: string) {},
	editorMode: 'hidden',
	setEditorMode(_mode: string) {}
};

export const PortalContext = React.createContext<PortalContextState>(DEFAULT_CONTEXT);

export function useSetPortalId(id: string) {
  const context = React.useContext(PortalContext);

  React.useEffect(() => {
    if (context) {
      context.setPortalId(id);
    }
  }, [id, context]);
}

export function usePortalProvider(): PortalContextState {
	return React.useContext(PortalContext);
}

export function PortalProvider(props: { children: React.ReactNode }) {
	const [portalId, setPortalId] = React.useState<string | null>(null);
	const [editorMode, setEditorMode] = React.useState('hidden');

	return (
		<>
			<PortalContext.Provider
				value={{
					portalId,
					setPortalId,
					editorMode, 
					setEditorMode, 
				}}
			>
				{props.children}
			</PortalContext.Provider>
		</>
	);
}
