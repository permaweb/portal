# Portal Style Guide

This guide outlines conventions for consistent, maintainable React code and theme-driven styling in the Portal codebase.

---

## 1. Project & File Structure

```
src/
 ├─ apps/           # Editor and viewer applications
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

- **Components**: PascalCase (`Button`, `PortalManager`)
- **Props**: Use `props.` prefix; avoid destructuring in signature
- **Handlers**: `handle` prefix (`handleSubmit`, `handleToggle`)
- **State**: Descriptive (`isLoading`, `hasError`, `selectedItem`)
- **Constants**: UPPER_SNAKE_CASE (`STYLING`, `ENDPOINTS`)

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
// Single concern - Set the current Portal ID
React.useEffect(() => {
	if (portals?.length > 0) {
		const currentPortal = portals.find((portal) => location.pathname.startsWith(`/${portal.id}`));
		if (currentPortal?.id) {
			if (currentId !== currentPortal.id) {
				setCurrentId(currentPortal.id);
			}
		}
	}
}, [location.pathname, portals, currentId]);

// Listen for the Portal ID, then populate the Portal
React.useEffect(() => {
	(async function () {
		try {
			if (!current && currentId && permawebProvider.libs) {
				handleInitPermissionSet(true);
				const cachedPortal = getCachedPortal(currentId);
				if (cachedPortal) {
					handlePortalSetup(cachedPortal);
				}

				setUpdating(true);
				const fetchedPortal = await fetchPortal();
				if (fetchedPortal) {
					handlePortalSetup(fetchedPortal);
					cachePortal(currentId, fetchedPortal);
				}
				setUpdating(false);
			}
		} catch (e: any) {
			console.error(e);
			setErrorMessage(e.message ?? 'An error occurred getting this portal');
			setUpdating(false);
		}
	})();
}, [current, currentId, permawebProvider.libs]);
```

---

## 5. Theming System

**✅ Always use theme values:**

```tsx
const StyledButton = styled.button`
	background: ${(props) => props.theme.colors.button.primary.background};
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.small};
`;
```

**❌ Never hardcode values:**

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
2. Support all theme variants (light/dark)
3. Use semantic color names from theme
4. Test theme switching

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
console.error(`Failed to fetch portal ${portalId}:`, error);
setError('Unable to load portal data. Please try again.');
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

This guide ensures consistency, maintainability, and accessibility across the Portal ecosystem through theme-driven development and atomic design principles.
