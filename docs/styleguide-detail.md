# React Style Guide

This guide outlines conventions for consistent, maintainable React code and theme-driven styling.

## Overview

This codebase follows atomic design principles with a strict component hierarchy (atoms → molecules → organisms) and theme-driven styling. All components must use theme values instead of hardcoded styles, and follow established patterns for state management, data fetching, and error handling.

**Key Principles:**

- **Atomic Structure**: Components organized by complexity (atoms, molecules, organisms)
- **Props Pattern**: Use `props.` prefix, avoid destructuring in function signatures
- **Data Loading**: Cache-first pattern with progressive enhancement
- **Error Handling**: Use `debugLog` for development, `addNotification` for users
- **Internationalization**: All user-facing text from language provider
- **Performance**: Strategic memoization with `useMemo`, `useCallback`, `React.memo`
- **Types**: Add all reusable types to `helpers/types.ts`
- **Comments**: Capitalize first letter (`// My comment`, not `// my comment`)
- **Theme-First**: Never hardcode colors, fonts, or spacing - always use theme values

---

## 1. Project & File Structure

```
src/
 ├─ apps/           # Editor and engine applications
 ├─ components/     # Reusable UI components
 │    ├─ atoms/       # Basic building blocks (buttons, inputs)
 │    ├─ molecules/   # Combinations of atoms (menus, cards)
 │    └─ organisms/   # Complex UI sections (forms, lists)
 ├─ providers/      # React context providers and hooks
 ├─ hooks/          # Custom React hooks
 ├─ helpers/        # Utilities, config, themes
 └─ store/          # Redux state management
```

### Component Structure

```
ComponentName/
├─ ComponentName.tsx  # Main component
├─ index.ts           # Export
└─ styles.ts          # Styled-components
```

### Import Order

1. React & core libraries
2. Third-party packages
3. Application providers
4. Components (atoms → molecules → organisms)
5. Helpers & utils
6. Local styles

---

## 2. Naming Conventions

- **Components**: PascalCase (`Button`, `UserManager`)
- **Props**: Use `props.` prefix; avoid destructuring in signature
- **Handlers**: `handle` prefix (`handleSubmit`, `handleToggle`)
- **State**: Descriptive (`isLoading`, `hasError`, `selectedItem`)
- **Constants**: UPPER_SNAKE_CASE (`STYLING`, `ENDPOINTS`)
- **Comments**: Capitalize first letter (`// My comment`, not `// my comment`)
- **Types**: Add all reusable types to `helpers/types.ts`

---

## 3. Component Structure

Follow this order in component files:

1. Hook declarations (providers, context)
2. Refs & reducers
3. Local state
4. Effects & callbacks
5. Helper functions
6. JSX return

```tsx
function Component(props: { label: string; handlePress: () => void }) {
	const provider = useProvider();
	const hasInitialized = React.useRef(false);
	const [isOpen, setIsOpen] = React.useState(false);

	React.useEffect(() => {
		if (!condition) return;
		// effect logic
	}, [condition]);

	const handleClick = React.useCallback(() => {
		// handler logic
	}, []);

	return <div>...</div>;
}
```

---

## 4. Effects & Data Fetching

- **Guard early**: `if (!condition) return;`
- **One concern per effect**: Separate data fetching from side effects
- **Prevent re-fetches**: Use `useRef` flags for one-time actions
- **Functional updates**: `setState(prev => ({ ...prev, newData }))`

```tsx
// Single concern - Set the current item ID
React.useEffect(() => {
	if (items?.length > 0) {
		const currentItem = items.find((item) => location.pathname.startsWith(`/${item.id}`));
		if (currentItem?.id) {
			if (currentId !== currentItem.id) {
				setCurrentId(currentItem.id);
			}
		}
	}
}, [location.pathname, items, currentId]);

// Listen for the item ID, then populate the item
React.useEffect(() => {
	(async function () {
		try {
			if (!current && currentId && provider.libs) {
				handleInitPermissionSet(true);
				const cachedItem = getCachedItem(currentId);
				if (cachedItem) {
					handleItemSetup(cachedItem);
				}

				setUpdating(true);
				const fetchedItem = await fetchItem();
				if (fetchedItem) {
					handleItemSetup(fetchedItem);
					cacheItem(currentId, fetchedItem);
				}
				setUpdating(false);
			}
		} catch (e: any) {
			console.error(e);
			setErrorMessage(e.message ?? 'An error occurred');
			setUpdating(false);
		}
	})();
}, [current, currentId, provider.libs]);
```

---

## 5. Theming System

**Always use theme values:**

```tsx
const StyledButton = styled.button`
	background: ${(props) => props.theme.colors.button.primary.background};
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.small};
`;
```

**Never hardcode values:**

```tsx
const StyledButton = styled.button`
	background: #ffffff;
	color: #000000;
	font-size: 14px;
`;
```

### Color System

- **Neutrals**: `neutral1-9` for backgrounds/borders
- **Text**: `neutralA1-7` for text/icons
- **Primary**: `primary1-2` for brand colors
- **Status**: `positive1-2`, `negative1-2`, `caution1`

### Typography

```tsx
font-family: ${props => props.theme.typography.family.primary}; // 'Open Sans'
font-size: ${props => props.theme.typography.size.base};        // 16px
font-weight: ${props => props.theme.typography.weight.medium};  // 500
```

---

## 6. Styling Patterns

### Component Styles Structure

```tsx
import styled from 'styled-components';
import { STYLING } from 'helpers/config';

// Helper functions
function getHeight(height?: number) {
	return height ? `${height}px` : STYLING.dimensions.button.height;
}

// Base styles
export const Wrapper = styled.div`
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.primary};
`;

// Variants using inheritance
export const Primary = styled(Wrapper)<{ active?: boolean }>`
	background: ${(props) =>
		props.active ? props.theme.colors.container.primary.active : props.theme.colors.container.primary.background};
`;
```

### Interactive States

```tsx
export const InteractiveElement = styled.button<{ active?: boolean }>`
	background: ${(props) => props.theme.colors.button.primary.background};

	&:hover:not(:disabled) {
		background: ${(props) => props.theme.colors.button.primary.active.background};
	}

	&:focus-visible {
		outline: 2px solid ${(props) => props.theme.colors.primary1};
	}

	&:disabled {
		background: ${(props) => props.theme.colors.button.primary.disabled.background};
		cursor: not-allowed;
	}
`;
```

### Responsive Design

```tsx
export const ResponsiveContainer = styled.div`
	max-width: ${STYLING.cutoffs.max};

	@media (max-width: ${STYLING.cutoffs.initial}) {
		padding: 10px;
	}
`;
```

---

## 7. Best Practices

### Theme-Driven Development

1. Always use theme values - never hardcode
2. Use semantic color names from theme

### Performance

```tsx
// Memoize pure components
const OptimizedComponent = React.memo(({ data }: Props) => <div>{data}</div>);

// Memoize expensive calculations
const value = React.useMemo(() => compute(data), [data]);

// Memoize handlers
const handleClick = React.useCallback(() => {}, []);
```

### Error Handling

```tsx
console.error(`Failed to fetch data ${id}:`, error);
setError('Unable to load data. Please try again.');
```

---

## 8. Examples

### Button Component

```tsx
// Button.tsx
export function Button(props: { label: string; onClick: () => void; disabled: boolean; icon: string }) {
	const handleClick = React.useCallback(() => {
		if (props.disabled) return;
		props.onClick();
	}, [props.disabled, props.onClick]);

	return (
		<S.Primary disabled={props.disabled} onClick={handleClick}>
			{props.icon && <S.Icon>{props.icon}</S.Icon>}
			<span>{props.label}</span>
		</S.Primary>
	);
}

// styles.ts
export const Primary = styled.button`
	background: ${(props) => props.theme.colors.button.primary.background};
	color: ${(props) => props.theme.colors.button.primary.color};
	border: 1px solid ${(props) => props.theme.colors.button.primary.border};
	font-family: ${(props) => props.theme.typography.family.primary};
	padding: 12px 24px;
	cursor: pointer;

	&:hover:not(:disabled) {
		background: ${(props) => props.theme.colors.button.primary.active.background};
	}

	&:disabled {
		background: ${(props) => props.theme.colors.button.primary.disabled.background};
		cursor: not-allowed;
	}
`;
```

---

## 9. Context & Provider Patterns

### Provider Structure

```tsx
// 1. Define interface
interface DataContextState {
	current: DataType | null;
	permissions: PermissionsType | null;
	refreshCurrent: (field?: string) => void;
}

// 2. Create DEFAULT_CONTEXT with empty values and no-op functions
const DEFAULT_CONTEXT = {
	current: null,
	permissions: null,
	refreshCurrent() {},
};

// 3. Create context
const DataContext = React.createContext<DataContextState>(DEFAULT_CONTEXT);

// 4. Export custom hook with "use[Name]Provider" naming
export function useDataProvider(): DataContextState {
	return React.useContext(DataContext);
}

// 5. Provider component named [Name]Provider
export function DataProvider(props: { children: React.ReactNode }) {
	return <DataContext.Provider value={...}>{props.children}</DataContext.Provider>;
}
```

---

## 10. Provider Hook Ordering

Always declare provider hooks in this order at the top of components:

```tsx
function Component() {
	// 1. Navigation/routing hooks
	const navigate = useNavigate();
	const location = useLocation();

	// 2. App-specific providers
	const dataProvider = useDataProvider();
	const settingsProvider = useSettingsProvider();

	// 3. Global providers
	const authProvider = useAuthProvider();
	const userProvider = useUserProvider();
	const languageProvider = useLanguageProvider();
	const { addNotification } = useNotifications();

	// 4. Derived values
	const language = languageProvider.object[languageProvider.current];

	// 5. Then refs, state, effects
}
```

---

## 11. Authorization Patterns

Always declare `unauthorized` variable early, after provider hooks:

```tsx
// Simple permission check
const unauthorized = !dataProvider.permissions?.update;

// Multiple permissions (OR logic)
const unauthorized = !dataProvider.permissions?.create && !dataProvider.permissions?.edit;

// With ownership check
const unauthorized =
	!dataProvider?.permissions?.create &&
	!dataProvider?.permissions?.edit &&
	props.item?.creator !== userProvider.profile.id;

// With opt-out
const unauthorized = !dataProvider.permissions?.update && !props.skipAuthCheck;

// Use in UI
<Button disabled={unauthorized} />;
```

---

## 12. Data Loading Patterns

### Cache-First Loading

Load cached data immediately, then fetch fresh data:

```tsx
React.useEffect(() => {
	(async function () {
		try {
			// 1. Load from cache for instant UI
			const cachedData = getCache(id);
			if (cachedData) setState(cachedData);

			// 2. Fetch fresh data in background
			const freshData = await fetchData(id);
			setState(freshData);
			setCache(id, freshData);
		} catch (e: any) {
			debugLog('error', 'Component', 'Error:', e.message ?? 'Unknown error');
			addNotification(e.message ?? 'Error occurred', 'warning');
		}
	})();
}, [id]);
```

### Progressive Loading

Load data on-demand to avoid N+1 queries:

```tsx
React.useEffect(() => {
	// Only fetch if not already loaded
	if (props.userId && !usersById?.[props.userId]) {
		fetchUserProfile({ id: props.userId });
	}
}, [props.userId, usersById]);
```

### Selective Refresh

```tsx
// Provider exposes refresh function
const [refreshTrigger, setRefreshTrigger] = React.useState(false);
const [refreshFields, setRefreshFields] = React.useState<string[] | null>(null);

const refreshData = (fields?: string[]) => {
	if (fields) setRefreshFields(fields);
	setRefreshTrigger((prev) => !prev); // Toggle to trigger
};

// Effect responds to trigger
React.useEffect(() => {
	if (refreshFields) {
		fetchData({ fields: refreshFields });
		setRefreshFields(null);
	}
}, [refreshTrigger]);

// Usage
refreshData(['overview', 'users']);
```

---

## 13. Error Handling & Logging

Use `debugLog` for development and `addNotification` for user messages:

```tsx
try {
	await operation();
} catch (e: any) {
	// Development logging (not shown to user)
	debugLog('error', 'ComponentName', 'Operation failed:', e.message ?? 'Unknown error');

	// User notification (always provide fallback)
	addNotification(e.message ?? 'Operation failed', 'warning');
}

// Info logging
debugLog('info', 'ComponentName', 'Action completed:', data);
```

---

## 14. Loading States

```tsx
const [loading, setLoading] = React.useState(false);

async function handleSubmit() {
	setLoading(true);
	try {
		await operation();
	} catch (e: any) {
		debugLog('error', 'Component', 'Error:', e.message ?? 'Unknown error');
		addNotification(e.message ?? 'Error occurred', 'warning');
	} finally {
		setLoading(false); // Always reset in finally
	}
}

// UI
{
	loading && <Loader message={`${language?.updating}...`} />;
}
<Button disabled={loading || unauthorized} loading={loading} />;
```

---

## 15. Ref-Based Control

### Prevent Duplicate Operations

```tsx
const hasInitialized = React.useRef(false);

if (!hasInitialized.current) {
	hasInitialized.current = true;
	performExpensiveOperation();
}
```

### Track User Interactions

```tsx
const hasUserSelected = React.useRef(false);

// Skip automatic updates after user interaction
React.useEffect(() => {
	if (hasUserSelected.current) return;
	setData(serverData); // Auto-populate
}, [serverData]);

function handleUserChange(value: string) {
	hasUserSelected.current = true; // User made a choice
	setData(value);
}
```

---

## 16. Form State Management

Track original values for change detection:

```tsx
const [data, setData] = React.useState(initialData);
const [originalData, setOriginalData] = React.useState(initialData);

// Detect changes
const hasChanges = React.useMemo(() => {
	return JSON.stringify(originalData) !== JSON.stringify(data);
}, [originalData, data]);

// Save only what changed
async function handleSave() {
	const updates: any = {};

	if (JSON.stringify(originalData.field1) !== JSON.stringify(data.field1)) {
		updates.field1 = data.field1;
	}

	if (Object.keys(updates).length === 0) {
		addNotification('No changes to save', 'warning');
		return;
	}

	await api.update(updates);
	setOriginalData(data);
}

// UI
<Button disabled={!hasChanges || loading} />;
```

---

## 17. Async Effects

Use IIFE pattern for async operations in effects:

```tsx
React.useEffect(() => {
	(async function () {
		try {
			if (!condition) return; // Early guard

			const data = await fetchData();
			setState(data);
		} catch (e: any) {
			debugLog('error', 'Component', 'Error:', e.message ?? 'Unknown error');
			addNotification(e.message ?? 'Error occurred', 'warning');
		}
	})();
}, [dependencies]);
```

---

## 18. Internationalization

```tsx
const languageProvider = useLanguageProvider();
const language = languageProvider.object[languageProvider.current];

// Use with optional chaining
label = {language?.create};
header = {language?.edit || 'Edit'};
message = {`${language?.loading}...`};

// Memoize language-dependent values
const paths = React.useMemo(
	() => [
		{ label: language?.home },
		{ label: language?.items },
	],
	[languageProvider.current]
); // Depend on current language
```

---

## 19. Performance Optimization

### When to Memoize

```tsx
// Memoize stable references for child components
const data = React.useMemo(
	() => dataProvider.current?.items || null,
	[dataProvider.current?.id, dataProvider.current?.items?.length]
);

// Memoize expensive computations
const sortedItems = React.useMemo(() => items.sort(compareFunction), [items]);

// Memoize handlers passed as props
const handleClick = React.useCallback(() => {
	setState(newValue);
}, []);

// Memoize expensive JSX
const panel = React.useMemo(() => <S.Panel>{/* Complex rendering */}</S.Panel>, [dependencies]);
```

### Component Memoization

```tsx
// Use React.memo for pure components
const ListItem = React.memo(({ item, index }: Props) => {
	return <div>{item.name}</div>;
});
```

---

## 20. Responsive Design Patterns

### Window Resize Handling

```tsx
const [desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));

function handleWindowResize() {
	setDesktop(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));
}

const debouncedResize = React.useCallback(debounce(handleWindowResize, 100), [handleWindowResize]);

React.useEffect(() => {
	window.addEventListener('resize', debouncedResize);
	return () => window.removeEventListener('resize', debouncedResize);
}, [debouncedResize]);
```

### Scroll Handling

```tsx
React.useEffect(() => {
	let lastScrollY = 0;
	let ticking = false;

	const handleScroll = () => {
		lastScrollY = window.scrollY;

		if (!ticking) {
			window.requestAnimationFrame(() => {
				// Perform DOM updates
				element.style.property = value;
				ticking = false;
			});
			ticking = true;
		}
	};

	window.addEventListener('scroll', handleScroll, { passive: true });

	return () => {
		window.removeEventListener('scroll', handleScroll);
	};
}, [dependencies]);
```

---

## 21. View/Page Structure

```tsx
// views/[ViewName]/index.tsx
export default function ViewName() {
	// 1. Navigation hooks
	const navigate = useNavigate();

	// 2. Providers
	const dataProvider = useDataProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	// 3. Local state
	const [selectedItems, setSelectedItems] = React.useState([]);

	// 4. Permission checks
	const unauthorized = !dataProvider.permissions?.requiredPermission;

	// 5. Return layout
	return (
		<>
			<S.Wrapper>
				<ViewHeader
					header={language?.viewTitle}
					actions={[
						<Button
							label={language?.action}
							handlePress={() => navigate(URLS.somewhere)}
							disabled={unauthorized}
							icon={ICONS.add}
						/>,
					]}
				/>
				<S.BodyWrapper>{/* Main content */}</S.BodyWrapper>
			</S.Wrapper>

			{/* Modals outside wrapper */}
			{showModal && <Modal>{/* Content */}</Modal>}
		</>
	);
}
```

---

## 22. Styled Components Helpers

```tsx
// styles.ts

// Helper functions for complex styling
function getRoleBackground(theme: DefaultTheme, role: string) {
	switch (role) {
		case 'Owner':
			return theme.colors.roles.primary;
		case 'Admin':
			return theme.colors.roles.alt1;
		default:
			return theme.colors.roles.alt5;
	}
}

// Use in styled component
export const UserRole = styled.div<{ role: string }>`
	background: ${(props) => getRoleBackground(props.theme, props.role)};
`;
```

---

This guide ensures consistency, maintainability, and accessibility through theme-driven development and atomic design principles.
