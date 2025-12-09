import { applyMiddleware, combineReducers, compose, legacy_createStore as createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';

import { debugLog } from 'helpers/utils';

import { currentPage } from './page';
import { currentPost, initStateCurrentPost } from './post';

declare const window: any;

const persistConfig = {
	key: 'root',
	storage,
	blacklist: [],
	migrate: (state: any) => {
		// Validate that the currentPost state has all required fields
		if (state?.currentPost) {
			const editor = state.currentPost.editor;
			const data = state.currentPost.data;

			// Check if markup field exists
			if (!editor?.markup) {
				debugLog('warn', 'store/index', 'Missing editor.markup field, resetting currentPost state');
				return Promise.resolve({
					...state,
					currentPost: initStateCurrentPost,
				});
			}

			// Check if all markup fields exist
			const requiredMarkupFields = ['bold', 'italic', 'underline', 'strikethrough'];
			for (const field of requiredMarkupFields) {
				if (!(field in editor.markup)) {
					debugLog('warn', 'store/index', `Missing markup.${field} field, resetting currentPost state`);
					return Promise.resolve({
						...state,
						currentPost: initStateCurrentPost,
					});
				}
			}

			// Check if all data fields from initStateCurrentPost exist, add missing ones
			if (data) {
				const missingFields: string[] = [];
				const updatedData = { ...data };

				for (const field in initStateCurrentPost.data) {
					if (!(field in data)) {
						missingFields.push(field);
						updatedData[field] = initStateCurrentPost.data[field as keyof typeof initStateCurrentPost.data];
					}
				}

				if (missingFields.length > 0) {
					debugLog(
						'warn',
						'store/index',
						`Missing data fields: ${missingFields.join(', ')}, adding with default values`
					);
					return Promise.resolve({
						...state,
						currentPost: {
							...state.currentPost,
							data: updatedData,
						},
					});
				}
			}
		}

		return Promise.resolve(state);
	},
};

const rootReducer = combineReducers({ currentPage, currentPost });

export type EditorStoreRootState = ReturnType<typeof store.getState>;
const persistedReducer = persistReducer<any, any>(persistConfig, rootReducer);

let composedEnhancer: any;
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
	composedEnhancer = compose(
		applyMiddleware(thunk),
		window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
	);
} else {
	composedEnhancer = compose(applyMiddleware(thunk));
}

export type AppDispatch = typeof store.dispatch;
export const store = createStore(persistedReducer, composedEnhancer);
export const persistor = persistStore(store);
