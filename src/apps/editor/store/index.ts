import { applyMiddleware, combineReducers, compose, legacy_createStore as createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';

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

			// Check if markup field exists
			if (!editor?.markup) {
				console.log('Missing editor.markup field, resetting currentPost state');
				return Promise.resolve({
					...state,
					currentPost: initStateCurrentPost,
				});
			}

			// Check if all markup fields exist
			const requiredMarkupFields = ['bold', 'italic', 'underline', 'strikethrough'];
			for (const field of requiredMarkupFields) {
				if (!(field in editor.markup)) {
					console.log(`Missing markup.${field} field, resetting currentPost state`);
					return Promise.resolve({
						...state,
						currentPost: initStateCurrentPost,
					});
				}
			}
		}

		return Promise.resolve(state);
	},
};

const rootReducer = combineReducers({ currentPost });

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
