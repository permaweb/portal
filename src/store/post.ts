import { Dispatch } from 'redux';

import { PortalAssetType, ReduxActionType } from 'helpers/types';

const UPDATE_CURRENT_POST = 'UPDATE_CURRENT_POST';

export const initStateCurrentPost: { data: PortalAssetType; editor: any } = {
	data: {
		id: null,
		title: '',
		content: null,
		creator: null,
		status: 'draft',
		categories: [],
		topics: [],
		thumbnail: null,
		dateCreated: null,
	},
	editor: {
		titleFocused: false,
		blockEditMode: false,
		toggleBlockFocus: false,
		panelOpen: true,
		loading: { active: false, message: null },
		submitDisabled: false,
		focusedBlock: null,
		lastAddedBlockId: null,
	},
};

export function currentPostUpdate(payload: { field: string; value: any }) {
	return (dispatch: Dispatch) => {
		dispatch({ type: UPDATE_CURRENT_POST, payload: payload });
	};
}

export function currentPost(
	state: { data: PortalAssetType; editor: any } = initStateCurrentPost,
	action: ReduxActionType
) {
	switch (action.type) {
		case UPDATE_CURRENT_POST:
			const { field, value } = action.payload;
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
		default:
			return state;
	}
}
