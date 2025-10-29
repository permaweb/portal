import { Dispatch } from 'redux';

import { PortalPageReduxType, ReduxActionType } from 'helpers/types';

const UPDATE_CURRENT_PAGE = 'UPDATE_CURRENT_PAGE';
const SET_ORIGINAL_DATA = 'SET_ORIGINAL_DATA';
const CLEAR_CURRENT_PAGE = 'CLEAR_CURRENT_PAGE ';

export const initStateCurrentPage: { data: PortalPageReduxType; originalData: any; editor: any } = {
	data: {
		id: null,
		title: '',
		content: null,
	},
	originalData: null,
	editor: {
		titleFocused: false,
		blockEditMode: true,
		toggleBlockFocus: false,
		panelOpen: true,
		loading: { active: false, message: null },
		submitDisabled: false,
		focusedBlock: null,
		lastAddedBlockId: null,
		markupUserInitiated: false,
		markup: {
			bold: false,
			italic: false,
			underline: false,
			strikethrough: false,
		},
	},
};

// Helper to check if editor state has all required fields
function validateEditorState(state: any): boolean {
	if (!state || typeof state !== 'object') return false;
	if (!state.editor || typeof state.editor !== 'object') return false;

	// Check for required top-level editor fields
	const requiredEditorFields = [
		'titleFocused',
		'blockEditMode',
		'toggleBlockFocus',
		'panelOpen',
		'loading',
		'submitDisabled',
		'focusedBlock',
		'lastAddedBlockId',
		'markupUserInitiated',
		'markup',
	];

	for (const field of requiredEditorFields) {
		if (!(field in state.editor)) {
			console.log(`Missing editor field: ${field}`);
			return false;
		}
	}

	// Check for required nested markup fields
	if (!state.editor.markup || typeof state.editor.markup !== 'object') {
		console.log('Missing or invalid editor.markup');
		return false;
	}

	const requiredMarkupFields = ['bold', 'italic', 'underline', 'strikethrough'];
	for (const field of requiredMarkupFields) {
		if (!(field in state.editor.markup)) {
			console.log(`Missing markup field: ${field}`);
			return false;
		}
	}

	return true;
}

export function currentPageUpdate(payload: { field: string; value: any }) {
	return (dispatch: Dispatch) => {
		dispatch({ type: UPDATE_CURRENT_PAGE, payload: payload });
	};
}

export function currentPageClear() {
	return (dispatch: Dispatch) => {
		dispatch({ type: CLEAR_CURRENT_PAGE });
	};
}

export function setOriginalData(data: any) {
	return (dispatch: Dispatch) => {
		dispatch({ type: SET_ORIGINAL_DATA, payload: data });
	};
}

export function currentPage(
	state: { data: PortalPageReduxType; originalData: any; editor: any } = initStateCurrentPage,
	action: ReduxActionType
) {
	// Validate state structure and reset if fields are missing
	if (!validateEditorState(state)) {
		console.log('Editor state validation failed, resetting to initial state');
		state = initStateCurrentPage;
	}

	switch (action.type) {
		case UPDATE_CURRENT_PAGE:
			const { field, value } = action.payload;

			if (field.includes('.')) {
				const [parent, child] = field.split('.');
				if (parent in state.editor && state.editor[parent] && typeof state.editor[parent] === 'object') {
					return {
						...state,
						editor: {
							...state.editor,
							[parent]: {
								...state.editor[parent],
								[child]: value,
							},
						},
					};
				}
				return state;
			}

			if (field in state.data) {
				return {
					...state,
					data: {
						...state.data,
						[field]: value,
					},
				};
			} else if (field in state.editor) {
				return {
					...state,
					editor: {
						...state.editor,
						[field]: value,
					},
				};
			}
			return state;
		case SET_ORIGINAL_DATA:
			return {
				...state,
				originalData: { ...action.payload },
			};
		case CLEAR_CURRENT_PAGE:
			return {
				...state,
				data: { ...initStateCurrentPage.data },
				originalData: null,
			};
		default:
			return state;
	}
}
